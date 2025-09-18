# 🐛 Debug Signature Recipe Issues

## Quick Debug Steps

### Step 1: Add Debug Component
Add this to your `web/src/app/page.tsx` (temporarily):

```tsx
import { DebugSignatureRecipes } from "@/components/debug-signature-recipes";

// Add this somewhere in your page component:
<DebugSignatureRecipes />
```

### Step 2: Check Console Logs
Open browser console and look for:
- 🔍 Loading signature recipes from Firestore...
- 📄 Processing document: [doc-id]
- 🖼️ Image URL from Firestore: [url]
- 🔄 Converting Firestore recipe: [title]

### Step 3: Check What You See
In the debug component, check:
- **Loading**: Should be "No" when done
- **Available**: Should be "Yes" 
- **Count**: Should be "1" (for your tomato recipe)
- **Image URL**: Should show the full URL or "❌ MISSING"
- **Steps Count**: Should be "6"

### Step 4: Test Image Loading
The debug component will show a test image. Check if:
- Image loads successfully (console: ✅ Image loaded successfully)
- Image fails to load (console: ❌ Image failed to load)

### Step 5: Check Recipe Browser
After debug, go to Recipe Browser → Signature tab and see:
- Is loading spinner still showing?
- Are recipes visible?
- Is image showing in the recipe cards?

## Possible Issues

### Issue 1: Hook Not Loading
- Debug shows: Loading=Yes (stuck), Count=0
- Solution: Check Firebase connection/auth

### Issue 2: Data Loading But Not Displaying  
- Debug shows: Count=1, but Recipe Browser shows loading
- Solution: Fix React state/useEffect issue

### Issue 3: Image URL Missing
- Debug shows: Image URL = "❌ MISSING"
- Solution: Check Firestore data or converter

### Issue 4: Image URL Present But Not Loading
- Debug shows: Image URL = [url], but image fails to load
- Solution: Check CORS/image server issues

## Next Steps
Run the debug and share what you see in:
1. The debug component display
2. Browser console logs
3. Recipe Browser behavior
