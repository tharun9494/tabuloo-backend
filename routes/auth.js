const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { auth } = require('../config/firebase');
const { GoogleAuthProvider, signInWithCredential } = require('firebase/auth');
const { verifyFirebaseToken } = require('../middleware/auth');

router.post('/google/signin', async (req, res) => {
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
router.get('/verify', verifyFirebaseToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        user: req.user
    });
});

// Test endpoint to get a token directly (DO NOT USE IN PRODUCTION)
router.post('/test-token', async (req, res) => {
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

module.exports = router;
