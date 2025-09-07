# All You Can Cook - API Integration

This directory contains the services and utilities for integrating with TheMealDB API, replacing the hardcoded recipes with a real recipe database.

## Overview

The integration provides:
- **Recipe Discovery**: Search, browse by category, country, or get random recipes
- **Offline Support**: Recipe caching for offline access
- **Data Transformation**: Convert TheMealDB format to our Recipe interface
- **Error Handling**: Graceful handling of API failures
- **Performance**: Caching and request optimization

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                           │
├─────────────────────────────────────────────────────────────┤
│  RecipeBrowser Component                                    │
│  ├── Search Bar                                            │
│  ├── Category Tabs (Random, Categories, Countries)        │
│  ├── Recipe Grid                                           │
│  └── Error States                                          │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                            │
│  ├── MealDB API Service (mealdb-api.ts)                   │
│  ├── Recipe Cache Service (recipe-cache.ts)               │
│  └── Data Transformer (mealdb-transformer.ts)             │
├─────────────────────────────────────────────────────────────┤
│  External API                                              │
│  └── TheMealDB API (www.themealdb.com)                    │
└─────────────────────────────────────────────────────────────┘
```

## Files

### API Service (`mealdb-api.ts`)
Handles all interactions with TheMealDB API:
- Search by name, letter, category, area, ingredient
- Get random meals
- Fetch categories, areas, ingredients
- Request caching (5 minutes)
- Error handling with custom error types

**Key Methods:**
```typescript
mealDBApi.searchByName('chicken')
mealDBApi.getRandomMeals(6)
mealDBApi.filterByCategory('Seafood')
mealDBApi.filterByArea('Italian')
mealDBApi.getCategories()
```

### Data Transformer (`mealdb-transformer.ts`)
Converts TheMealDB data to our Recipe format:
- Parses ingredients with amounts and units
- Splits instructions into cooking steps
- Estimates difficulty, cooking times, and servings
- Categorizes ingredients
- Extracts cooking tips and warnings

**Key Functions:**
```typescript
transformMealDBToRecipe(mealDBMeal) // Single recipe
transformMealDBToRecipes(mealDBMeals) // Multiple recipes
createRecipePreview(recipe) // For list views
```

### Recipe Cache (`recipe-cache.ts`)
Provides offline support and performance optimization:
- localStorage-based caching (24-hour TTL)
- LRU eviction (max 100 recipes)
- Search within cached recipes
- Access statistics and popularity tracking
- Import/export functionality

**Key Methods:**
```typescript
recipeCache.cacheRecipe(recipe)
recipeCache.getCachedRecipe(id)
recipeCache.searchCachedRecipes(query)
recipeCache.getRecentRecipes(10)
recipeCache.getCacheStats()
```

### API Types (`../types/mealdb-api.ts`)
TypeScript definitions for TheMealDB API responses:
- `MealDBMeal` - Full meal data
- `MealDBCategory` - Category information
- `MealDBArea` - Country/cuisine information
- `RecipeSearchFilters` - Search parameters
- API endpoints configuration

## Usage Examples

### Basic Recipe Search
```typescript
import { mealDBApi } from '@/services/mealdb-api';
import { transformMealDBToRecipes } from '@/utils/mealdb-transformer';

// Search for recipes
const meals = await mealDBApi.searchByName('pasta');
const recipes = transformMealDBToRecipes(meals);

// Use in component
recipes.forEach(recipe => {
  console.log(`${recipe.title} - ${recipe.difficulty} - ${recipe.totalTime}min`);
});
```

### Browse by Category
```typescript
// Get all categories
const categoriesData = await mealDBApi.getCategories();
const categories = categoriesData.categories.map(cat => cat.strCategory);

// Get recipes from a category
const meals = await mealDBApi.filterByCategory('Dessert');
const dessertRecipes = transformMealDBToRecipes(meals);
```

### Caching for Offline Use
```typescript
import { recipeCache } from '@/services/recipe-cache';

// Cache recipes as user browses
recipeCache.cacheRecipes(recipes);

// Later, get cached recipes (works offline)
const cachedRecipes = recipeCache.getAllCachedRecipes();
const recentRecipes = recipeCache.getRecentRecipes(10);

// Search within cache
const searchResults = recipeCache.searchCachedRecipes('chicken');
```

## API Limitations (Free Tier)

TheMealDB free API has these limitations:
- No multi-ingredient filtering
- No premium features (latest meals, random selection)
- Rate limiting (not specified, but we cache to be respectful)

**Workarounds:**
- Simulate multi-random meals by making multiple single random requests
- Cache popular searches to reduce API calls
- Provide offline browsing of previously viewed recipes

## Error Handling

The integration includes comprehensive error handling:

```typescript
try {
  const meals = await mealDBApi.searchByName('chicken');
  // Handle success
} catch (error) {
  if (error instanceof MealDBApiError) {
    // API-specific error with status code
    console.error(`API Error ${error.statusCode}: ${error.message}`);
  } else {
    // Network or other error
    console.error('Unexpected error:', error);
  }
}
```

## Performance Optimizations

1. **Request Caching**: API responses cached for 5 minutes
2. **Recipe Caching**: Full recipes cached for 24 hours in localStorage
3. **Batch Processing**: Transform multiple recipes efficiently
4. **Lazy Loading**: Load recipe details only when needed
5. **Image Optimization**: Use TheMealDB's thumbnail URLs

## Data Transformation Details

### Difficulty Estimation
Based on:
- Number of ingredients (5=Easy, 10=Medium, 10+=Hard)
- Instruction complexity (length, cooking terms)
- Number of cooking steps

### Time Estimation
- Extracts times from instructions when available
- Falls back to category-based estimates
- Splits into prep time (33%) and cook time (67%)

### Ingredient Parsing
- Handles various measurement formats
- Parses fractions (½, ¼, ¾, etc.)
- Categorizes ingredients (protein, vegetable, dairy, etc.)
- Extracts preparation notes

### Step Generation
- Splits long instructions into logical steps
- Extracts cooking times and temperatures
- Generates cooking tips based on common patterns
- Adds safety warnings for hazardous operations

## Testing

Use the demo script to test the integration:

```typescript
import { RecipeApiDemo } from '@/utils/api-demo';

// Run all demos
const results = await RecipeApiDemo.runAllDemos();

// Or run individual demos
const searchResults = await RecipeApiDemo.demoSearch();
const randomRecipes = await RecipeApiDemo.demoRandomRecipes();
```

## Future Enhancements

1. **Premium API**: Upgrade to premium for additional features
2. **Recipe Database**: Integrate with multiple recipe sources
3. **User Ratings**: Add rating and review system
4. **Nutritional Data**: Enhanced nutrition information
5. **Recipe Scaling**: Automatic ingredient scaling for different servings
6. **Shopping Lists**: Generate shopping lists from recipes
7. **Meal Planning**: Weekly meal planning features

## Configuration

The API service is configured in `mealdb-api.ts`:

```typescript
const MEALDB_ENDPOINTS = {
  BASE_URL: 'https://www.themealdb.com/api/json/v1/1',
  // ... endpoint definitions
};

// Cache configuration
private cacheTimeout = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // recipes
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
```

Adjust these values based on your needs and API usage patterns.
