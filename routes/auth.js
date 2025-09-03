const express = require('express');
const router = express.Router();
const { auth, isFirebaseConfigured } = require('../config/firebase');

// Middleware to check if Firebase is configured
const requireFirebase = (req, res, next) => {
    if (!isFirebaseConfigured()) {
        return res.status(503).json({
            error: 'Firebase authentication not configured',
            message: 'Firebase environment variables are not set. Authentication features are disabled.',
            details: 'Please configure Firebase environment variables to enable authentication.'
        });
    }
    next();
};

// Load Firebase dependencies only if configured
let admin, GoogleAuthProvider, signInWithCredential, verifyFirebaseToken;

if (isFirebaseConfigured()) {
    admin = require('firebase-admin');
    const firebaseAuth = require('firebase/auth');
    GoogleAuthProvider = firebaseAuth.GoogleAuthProvider;
    signInWithCredential = firebaseAuth.signInWithCredential;
    const authMiddleware = require('../middleware/auth');
    verifyFirebaseToken = authMiddleware.verifyFirebaseToken;
}

router.post('/google/signin', requireFirebase, async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // First try to get user info from Google using the token
        let userInfo;
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            userInfo = await response.json();
            
            if (!userInfo.email) {
                throw new Error('Failed to get user info from Google');
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            return res.status(401).json({ 
                error: 'Invalid token',
                details: error.message 
            });
        }
        
        // Get or create the user in Firebase
        let userRecord;
        try {
            // Try to get existing user
            userRecord = await admin.auth().getUserByEmail(userInfo.email);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // Create new user if doesn't exist
                userRecord = await admin.auth().createUser({
                    email: userInfo.email,
                    emailVerified: userInfo.email_verified,
                    displayName: userInfo.name,
                    photoURL: userInfo.picture,
                    disabled: false
                });
                
                // Set custom claims if needed
                await admin.auth().setCustomUserClaims(userRecord.uid, {
                    provider: 'google'
                });
            } else {
                throw error;
            }
        }

        // Create a custom token for the user
        const customToken = await admin.auth().createCustomToken(userRecord.uid);

        const userResponse = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            emailVerified: userRecord.emailVerified
        };

        res.status(200).json({
            message: 'Successfully signed in',
            user: userResponse,
            customToken: customToken
        });
    } catch (error) {
        console.error('Error in Google sign in:', error);
        res.status(500).json({
            error: 'Failed to sign in with Google',
            details: error.message
        });
    }
});

// Protected route example - requires valid Firebase token
router.get('/verify', requireFirebase, (req, res, next) => {
    if (verifyFirebaseToken) {
        verifyFirebaseToken(req, res, () => {
            res.json({
                success: true,
                message: 'Token is valid',
                user: req.user
            });
        });
    } else {
        res.status(503).json({
            error: 'Firebase verification not available'
        });
    }
});

// Test endpoint to get a token directly (DO NOT USE IN PRODUCTION)
router.post('/test-token', requireFirebase, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Create a test user and get token
        const userCredential = await auth.createUserWithEmailAndPassword(
            email,
            password
        );
        
        const token = await userCredential.user.getIdToken();
        
        res.json({
            success: true,
            token: token,
            user: {
                uid: userCredential.user.uid,
                email: userCredential.user.email
            }
        });
    } catch (error) {
        console.error('Error creating test token:', error);
        res.status(500).json({
            error: 'Failed to create test token',
            details: error.message
        });
    }
});

// Health check for auth service
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Auth service is running',
        firebaseConfigured: isFirebaseConfigured(),
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
