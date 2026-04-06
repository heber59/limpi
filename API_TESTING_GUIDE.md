# API Testing Guide

## 1. Get Firebase ID Token
First, you need a Firebase ID token for authentication. You can get this by:

### Option A: Firebase Console
1. Go to Firebase Console → Authentication → Users
2. Find your user and click on it
3. In the user details, click 'Create custom token' or use the existing token

### Option B: Firebase Admin SDK (if you have it set up)
Use your Firebase Admin SDK to generate a custom token.

### Option C: Client App
If you have a client app, sign in and get the ID token from there.

## 2. Test Endpoints

### Base URL: http://localhost:3000
### Auth Header: Authorization: Bearer YOUR_FIREBASE_ID_TOKEN

## Endpoints to Test:
