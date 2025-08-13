const express = require('express');
const router = express.Router();
const { auth } = require('../config/firebase');
const { GoogleAuthProvider, signInWithCredential } = require('firebase/auth');

router.post('/google/signin', async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ error: 'ID token is required' });
        }

        // Create credential from the Google ID Token
        const credential = GoogleAuthProvider.credential(idToken);
        
        // Sign in with credential
        const result = await signInWithCredential(auth, credential);
        const user = result.user;

        // Create a custom token or session for your backend
        const userResponse = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };

        // You might want to create a session or JWT token here
        res.status(200).json({
            message: 'Successfully signed in',
            user: userResponse
        });
    } catch (error) {
        console.error('Error in Google sign in:', error);
        res.status(500).json({
            error: 'Failed to sign in with Google',
            details: error.message
        });
    }
});

module.exports = router;
