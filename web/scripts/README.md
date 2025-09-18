# 🔥 Firestore Scripts

## Available Scripts

### `add-signature-recipe-auth.ts`
Adds signature recipes to Firestore with authentication.

**Usage:**
```bash
pnpm add-signature-recipe
```

**Requirements:**
- Firebase Authentication user account
- Environment variables in `.env.local`:
  ```bash
  FIREBASE_ADMIN_EMAIL=your-email@gmail.com
  FIREBASE_ADMIN_PASSWORD=your-password
  ```

### `check-env.ts`
Checks if Firebase environment variables are properly configured.

**Usage:**
```bash
pnpm check-firebase-env
```

## Adding New Signature Recipes

To add more signature recipes, modify the `recipeData` object in `add-signature-recipe-auth.ts` with your new recipe details, then run the script.
