const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

// Firebase configuration with validation
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!(
    process.env.FIREBASE_API_KEY &&
    process.env.FIREBASE_AUTH_DOMAIN &&
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_STORAGE_BUCKET &&
    process.env.FIREBASE_MESSAGING_SENDER_ID &&
    process.env.FIREBASE_APP_ID
  );
};

let app = null;
let auth = null;

// Only initialize Firebase if properly configured
if (isFirebaseConfigured()) {
  try {
    console.log('📱 Initializing Firebase...');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ Firebase not configured. Authentication features will be disabled.');
  console.warn('⚠️ To enable Firebase, configure the following environment variables:');
  console.warn('   - FIREBASE_API_KEY');
  console.warn('   - FIREBASE_AUTH_DOMAIN');
  console.warn('   - FIREBASE_PROJECT_ID');
  console.warn('   - FIREBASE_STORAGE_BUCKET');
  console.warn('   - FIREBASE_MESSAGING_SENDER_ID');
  console.warn('   - FIREBASE_APP_ID');
}

module.exports = { 
  auth, 
  app, 
  isFirebaseConfigured 
};
