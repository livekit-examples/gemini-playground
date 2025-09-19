// Transform TheMealDB data to our Recipe format
// Handles the conversion from MealDB's structure to our cooking app's Recipe interface

import { MealDBMeal, MealDBMealPreview } from '@/types/mealdb-api';
import { Recipe, Ingredient } from '@/data/recipe-types';

// Note: We no longer estimate difficulty, cooking time, or servings
// as these are not provided by the MealDB API and should not be fabricated

// Transform MealDB preview data (from category/area filtering) to minimal Recipe format
// This creates a "preview" recipe with just the essential info for list display
export function transformMealDBPreviewToRecipe(preview: MealDBMealPreview): Recipe {
  return {
    id: preview.idMeal,
    title: preview.strMeal,
    description: `Delicious ${preview.strMeal} recipe`, // Generic description for preview
    imageUrl: preview.strMealThumb,
    
    // Preview recipes don't have full details - these will be loaded when selected
    ingredients: [], // Empty - will be populated when full recipe is loaded
    instructions: '', // Empty - will be populated when full recipe is loaded
    tags: [], // Empty - will be populated when full recipe is loaded
    category: '', // Empty - will be populated when full recipe is loaded
    cuisine: '', // Empty - will be populated when full recipe is loaded
    
    // Optional fields that are not provided by MealDB API
    servings: undefined,
    prepTime: undefined,
    cookTime: undefined,
    totalTime: undefined,
    difficulty: undefined,
    
    // Metadata
    source: 'TheMealDB',
    sourceUrl: `https://www.themealdb.com/meal/${preview.idMeal}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Mark as preview so we know to load full details later
    isPreview: true,
  };
}

// Transform multiple MealDB previews to Recipe previews
export function transformMealDBPreviewsToRecipes(previews: MealDBMealPreview[]): Recipe[] {
  return previews.map(transformMealDBPreviewToRecipe);
}

// Convert full MealDB meal to preview format (for consistency with category/area filtering)
export function convertMealDBToPreview(meal: MealDBMeal): MealDBMealPreview {
  return {
    idMeal: meal.idMeal,
    strMeal: meal.strMeal,
    strMealThumb: meal.strMealThumb,
  };
}

// Transform full MealDB meals to Recipe previews (for random recipes)
export function transformMealDBToRecipePreviews(meals: MealDBMeal[]): Recipe[] {
  const previews = meals.map(convertMealDBToPreview);
  return transformMealDBPreviewsToRecipes(previews);
}

// Parse ingredients from MealDB format
function parseIngredients(meal: MealDBMeal): Ingredient[] {
  const ingredients: Ingredient[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const ingredientKey = `strIngredient${i}` as keyof MealDBMeal;
    const measureKey = `strMeasure${i}` as keyof MealDBMeal;
    
    const ingredientName = meal[ingredientKey]?.trim();
    const measure = meal[measureKey]?.trim();
    
    if (!ingredientName) continue;
    
    // Parse amount and unit from measure
    let amount = 1;
    let unit = 'piece';
    let notes = '';
    
    if (measure) {
      // Common patterns in MealDB measurements
      const measurePatterns = [
        /^(\d+(?:\.\d+)?)\s*(\w+)(.*)$/,  // "2 cups chopped"
        /^(\d+(?:\.\d+)?)\s*(.*)$/,       // "2 chopped"
        /^(½|¼|¾|⅓|⅔|⅛)\s*(\w+)(.*)$/,   // "½ cup"
        /^(a\s+)?(\w+)(.*)$/,             // "a pinch"
      ];
      
      let parsed = false;
      for (const pattern of measurePatterns) {
        const match = measure.match(pattern);
        if (match) {
          if (match[1] && !match[1].startsWith('a')) {
            // Handle fractions
            const fractionMap: Record<string, number> = {
              '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.33, '⅔': 0.67, '⅛': 0.125
            };
            amount = fractionMap[match[1]] || parseFloat(match[1]) || 1;
          }
          
          if (match[2]) {
            unit = match[2].toLowerCase();
          }
          
          if (match[3]) {
            notes = match[3].trim();
          }
          
          parsed = true;
          break;
        }
      }
      
      if (!parsed) {
        // If no pattern matches, use the whole measure as notes
        notes = measure;
      }
    }
    
    // Categorize ingredient
    const category = categorizeIngredient(ingredientName);
    
    ingredients.push({
      id: `ingredient-${i}`,
      name: ingredientName,
      amount,
      unit,
      notes: notes || undefined,
      category
    });
  }
  
  return ingredients;
}

// Categorize ingredients
function categorizeIngredient(name: string): 'protein' | 'vegetable' | 'dairy' | 'grain' | 'spice' | 'other' {
  const lowerName = name.toLowerCase();
  
  // Protein
  if (/chicken|beef|pork|lamb|fish|salmon|tuna|shrimp|egg|tofu|beans|lentils|turkey|duck/i.test(lowerName)) {
    return 'protein';
  }
  
  // Vegetables
  if (/onion|garlic|tomato|pepper|carrot|celery|mushroom|spinach|lettuce|cucumber|potato|broccoli|cauliflower|zucchini|eggplant/i.test(lowerName)) {
    return 'vegetable';
  }
  
  // Dairy
  if (/milk|cream|cheese|butter|yogurt|sour cream/i.test(lowerName)) {
    return 'dairy';
  }
  
  // Grains
  if (/rice|pasta|bread|flour|oats|quinoa|barley|wheat/i.test(lowerName)) {
    return 'grain';
  }
  
  // Spices and seasonings
  if (/salt|pepper|paprika|cumin|oregano|basil|thyme|rosemary|sage|parsley|cilantro|ginger|garlic powder|onion powder|bay|cinnamon|nutmeg|cloves|cardamom/i.test(lowerName)) {
    return 'spice';
  }
  
  return 'other';
}

// Process raw instructions string
function processInstructions(instructions: string): string {
  if (!instructions) return '';
  
  // Return the raw instructions as-is, trimmed
  // Let the AI handle understanding and breaking down the steps
  return instructions.trim();
}

// Main transformation function
export function transformMealDBToRecipe(meal: MealDBMeal): Recipe {
  const ingredients = parseIngredients(meal);
  const instructions = processInstructions(meal.strInstructions);
  
  // Parse tags
  const tags: string[] = [meal.strCategory, meal.strArea];
  if (meal.strTags) {
    tags.push(...meal.strTags.split(',').map(tag => tag.trim()));
  }
  
  // Remove duplicates and empty tags
  const uniqueTags = Array.from(new Set(tags.filter(tag => tag && tag.length > 0)));
  
  return {
    id: `mealdb-${meal.idMeal}`,
    title: meal.strMeal,
    description: `A delicious ${meal.strCategory.toLowerCase()} recipe from ${meal.strArea}. ${
      meal.strTags ? `Features: ${meal.strTags.replace(/,/g, ', ')}.` : ''
    }`.trim(),
    // Note: MealDB API doesn't provide servings, prep time, cook time, or difficulty
    // These fields are left undefined rather than generating fake data
    ingredients,
    instructions,
    tags: uniqueTags,
    imageUrl: meal.strMealThumb,
    author: 'TheMealDB',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Transform multiple meals
export function transformMealDBToRecipes(meals: MealDBMeal[]): Recipe[] {
  return meals.map(transformMealDBToRecipe);
}

// Create a recipe preview for list views
export function createRecipePreview(recipe: Recipe) {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    difficulty: recipe.difficulty, // May be undefined for API recipes
    totalTime: recipe.totalTime,   // May be undefined for API recipes
    imageUrl: recipe.imageUrl,
    tags: recipe.tags.slice(0, 3), // Limit tags for preview
  };
}
