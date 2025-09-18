# Firebase Authentication Setup

This guide will help you set up Firebase Authentication for the All You Can Cook app.

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" (or "Add project")
3. Enter your project name (e.g., "all-you-can-cook")
4. Follow the setup wizard (you can disable Google Analytics if not needed)

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Google" as a sign-in provider:
   - Click on "Google"
   - Toggle "Enable"
   - Set your project's public-facing name
   - Choose your support email
   - Click "Save"

## 3. Set Up Cloud Firestore

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development) or "Start in production mode"
   - For test mode: Rules allow read/write access for 30 days
   - For production mode: You'll need to configure security rules
4. Select a location for your database (choose one close to your users)
5. Click "Done"

### Firestore Security Rules (Production)

If you chose production mode, update your Firestore rules to allow authenticated users to read/write recipes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read all recipes
    match /recipes/{recipeId} {
      allow read: if true; // Anyone can read recipes
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Allow users to manage their own user documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. Register Your Web App

1. In your Firebase project overview, click the web icon (`</>`) to add a web app
2. Register your app with a nickname (e.g., "all-you-can-cook-web")
3. You don't need to set up hosting for now
4. Copy the Firebase configuration object

## 5. Configure Environment Variables

Create a `.env.local` file in the `web/` directory with your Firebase configuration:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the placeholder values with your actual Firebase configuration values from step 3.

## 6. Set Up Authorized Domains

1. In Firebase Authentication, go to "Settings" > "Authorized domains"
2. Add your domains:
   - `localhost` (for local development)
   - Your production domain (e.g., `yourdomain.com`)

## 7. Test the Setup

1. Start your development server: `pnpm dev`
2. Navigate to your app
3. Click the "Sign In" button in the header
4. Try signing in with Google
5. You should see your profile picture in the header after successful login

## Features Implemented

✅ **Login Page**: Modal dialog with Google authentication  
✅ **Header Integration**: Sign-in button that transforms into user profile dropdown  
✅ **Protected Cooking Sessions**: Users must login to start AI cooking sessions  
✅ **Recipe Browsing**: Users can view recipes without logging in  
✅ **Redirect Flow**: Users are returned to their previous location after login  
✅ **Signature Recipes**: Curated recipes loaded from Firestore database  
✅ **Graceful Fallback**: App works with or without Firebase configuration  
✅ **Seamless Integration**: Signature tab added without disrupting existing functionality  

## Authentication Flow

1. **Anonymous Users**: Can browse recipes and view recipe details
2. **Login Required**: When users try to start a cooking session, they're prompted to login
3. **Post-Login**: Users are automatically redirected back to continue their cooking session
4. **Profile Management**: Logged-in users can see their profile and sign out from the header

## Firestore Signature Recipe System

### Overview

The app uses Firestore to store and serve **signature recipes** - a curated collection of featured recipes. The existing recipe system (MealDB API) is preserved for all other recipe browsing functionality.

### Recipe Schema

Signature recipes in the `recipes` Firestore collection use this schema:

- **id**: UUID - Unique recipe identifier
- **title**: String - Recipe name
- **description**: String - Recipe description
- **ingredients**: Array of ingredient objects with name, amount, unit, and tags
- **steps**: Array of step objects with instructions and equipment
- **serving**: Number - Number of servings
- **total_time**: Number - Total cooking time in minutes
- **difficulty**: Number - Difficulty level (1=Easy, 2=Medium, 3=Hard)
- **imageUrl**: String - Recipe image URL
- **tags**: Array of categorized tags (country, dietary, style, etc.)
- **author**: String - User ID of recipe creator (optional)
- **create_date**: Timestamp - When recipe was created
- **version**: Number - Recipe version for updates

### Available Operations

- **Read Signature Recipes**: Load curated signature recipes from Firestore
- **Graceful Fallback**: If Firebase is not configured, the app works normally with existing recipe sources
- **Automatic Loading**: Signature recipes load automatically in the new "Signature" tab

### Usage Example

```typescript
import { useSignatureRecipes } from '@/hooks/use-signature-recipes';

function MyComponent() {
  const { 
    recipes, 
    loading, 
    error,
    isAvailable,
    refreshRecipes 
  } = useSignatureRecipes();

  // Recipes automatically load on mount
  // Refresh manually if needed
  await refreshRecipes();
}
```

### Integration

- **Signature Tab**: New first tab in recipe browser showing curated recipes
- **Existing Tabs**: All existing functionality (Random, Categories, Countries) preserved
- **Seamless Experience**: Users see signature recipes if available, existing recipes otherwise

## Security Notes

- All Firebase configuration variables are prefixed with `NEXT_PUBLIC_` as they need to be available on the client side
- Firebase handles all authentication security, including token management and validation
- Firestore security rules allow anyone to read signature recipes (no authentication required)
- Writing to Firestore is only needed for adding new signature recipes (admin function)
- The app gracefully handles cases where Firebase is not configured
