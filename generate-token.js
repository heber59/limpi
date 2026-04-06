#!/usr/bin/env node

// Script to generate Firebase custom token for testing
// Run with: node generate-token.js <user-uid>

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

async function generateToken(uid) {
  try {
    const customToken = await admin.auth().createCustomToken(uid);
    console.log('✅ Custom Token Generated:');
    console.log(customToken);
    console.log('');
    console.log('📝 To get an ID token from this custom token:');
    console.log('1. Use this custom token in your client app');
    console.log(
      '2. Sign in with Firebase SDK: signInWithCustomToken(customToken)',
    );
    console.log('3. Get the ID token: user.getIdToken()');
    console.log('');
    console.log(
      '🧪 For testing, you can use Firebase Admin to create a proper ID token:',
    );
    console.log('(But this requires additional setup)');
  } catch (error) {
    console.error('❌ Error generating token:', error);
  }
}

const uid = process.argv[2];
if (!uid) {
  console.log('Usage: node generate-token.js <user-uid>');
  console.log('Example: node generate-token.js user123');
  process.exit(1);
}

generateToken(uid);
