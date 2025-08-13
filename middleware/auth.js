const admin = require('firebase-admin');
const { auth } = require('../config/firebase');

// Initialize Firebase Admin with service account
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        }),
        projectId: process.env.FIREBASE_PROJECT_ID
    });
}

const verifyFirebaseToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Unauthorized', 
                message: 'No token provided' 
            });
        }

        const idToken = authHeader.split('Bearer ')[1];
        
        // Verify the token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // Add the user details to the request object
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            email_verified: decodedToken.email_verified,
            name: decodedToken.name,
            picture: decodedToken.picture
        };
        
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Invalid token' 
        });
    }
};

module.exports = { verifyFirebaseToken };
