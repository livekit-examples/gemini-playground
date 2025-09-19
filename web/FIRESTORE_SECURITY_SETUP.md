# Firestore Security Rules Setup

## Problem
You're getting a "Missing or insufficient permissions" error when trying to save recipe completion history. This is because Firestore security rules are blocking write access to the `Recipe_History` collection.

## Solution
Deploy the updated Firestore security rules that allow authenticated users to write their own recipe history.

## Quick Fix (Recommended)

### Option 1: Deploy via Firebase Console (Easiest)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Firestore Database → Rules
4. Replace the existing rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to recipes collection for all users
    match /recipes/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to write their own recipe history
    match /Recipe_History/{document} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

5. Click "Publish"

### Option 2: Deploy via Firebase CLI
1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init
   ```

4. Deploy the rules:
   ```bash
   pnpm deploy-firestore-rules
   ```

## What These Rules Do

### Recipe_History Collection
- ✅ **CREATE**: Users can create their own recipe history records
- ✅ **READ**: Users can only read their own recipe history  
- ✅ **UPDATE**: Users can only update their own records
- ✅ **DELETE**: Users can only delete their own records
- ❌ **Cross-user access**: Users cannot access other users' recipe history

### Recipes Collection  
- ✅ **READ**: Anyone can read recipes (public access)
- ✅ **WRITE**: Only authenticated users can write recipes

### Security Features
- **User isolation**: Each user can only access their own recipe history
- **Authentication required**: All write operations require user authentication
- **Principle of least privilege**: Default deny for all other collections

## Testing
After deploying the rules, try completing a recipe again. The "Missing or insufficient permissions" error should be resolved, and recipe completions will be saved to Firestore.

## Verification
You can verify the rules are working by:
1. Completing a recipe
2. Checking the browser console for success message: `✅ Recipe completion saved to history with ID: [document-id]`
3. Checking Firestore Database → Recipe_History collection in Firebase Console

## Security Notes
- These rules ensure user data privacy and security
- Each user's recipe history is completely isolated from others
- All operations require proper authentication
- The rules follow Firebase security best practices
