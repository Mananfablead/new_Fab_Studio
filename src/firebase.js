import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  if (missing.length > 0) {
    console.error('Missing Firebase configuration:', missing);
    console.error('Please copy .env.example to .env and update with your Firebase project credentials');
    return false;
  }
  return true;
};

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let messaging;

try {
  if (validateFirebaseConfig()) {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    console.log('Firebase initialized successfully');
  } else {
    console.error('Firebase initialization failed due to missing configuration');
    // Create dummy messaging to prevent crashes
    messaging = null;
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  messaging = null;
}

export { messaging };
