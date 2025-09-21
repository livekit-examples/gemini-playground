// Utility functions to convert Firestore signature recipes to existing Recipe types

import { Recipe, Ingredient } from '@/data/recipe-types';
import { 
  FirestoreRecipe, 
  FirestoreIngredient, 
  FirestoreTag, 
  FirestoreNutrition
} from '@/types/firestore-types';

/**
 * Convert FirestoreRecipe back to existing Recipe format
 */
export function firestoreRecipeToRecipe(firestoreRecipe: FirestoreRecipe): Recipe {
  // Concatenate multiple Firestore steps into a single instruction string
  const instructions = firestoreRecipe.steps
    .sort((a, b) => a.number - b.number) // Ensure steps are in correct order
    .map((step, index) => `${index + 1}. ${step.instruction}`)
    .join('\n\n'); // Use double newline for better readability between steps

  return {
    id: firestoreRecipe.id,
    title: firestoreRecipe.title,
    description: firestoreRecipe.description,
    ingredients: firestoreRecipe.ingredients.map(firestoreIngredientToIngredient),
    instructions,
    servings: firestoreRecipe.serving,
    totalTime: firestoreRecipe.total_time,
    difficulty: numberToDifficulty(firestoreRecipe.difficulty) as 'Easy' | 'Medium' | 'Hard',
    imageUrl: firestoreRecipe.imageUrl,
    tags: firestoreRecipe.tags?.map(firestoreTagToTag) || [],
    nutrition: convertFirestoreNutrition(firestoreRecipe.nutrition_info),
    isPreview: false, // Firestore recipes are always full recipes
    source: 'firestore',
    createdAt: firestoreRecipe.create_date,
    updatedAt: firestoreRecipe.create_date, // Use create_date as updatedAt since we don't track updates separately
  };
}


/**
 * Convert FirestoreIngredient back to existing Ingredient format
 */
function firestoreIngredientToIngredient(firestoreIngredient: FirestoreIngredient): Ingredient {
  return {
    id: generateIngredientId(),
    name: firestoreIngredient.name,
    amount: firestoreIngredient.amount_from,
    unit: firestoreIngredient.unit,
    optional: firestoreIngredient.optional,
  };
}


/**
 * Convert FirestoreTag back to existing tag string format
 */
function firestoreTagToTag(firestoreTag: FirestoreTag): string {
  return firestoreTag.value;
}


/**
 * Convert difficulty number back to string
 */
function numberToDifficulty(difficulty: number): string {
  switch (difficulty) {
    case 1: return 'Easy';
    case 2: return 'Medium';
    case 3: return 'Hard';
    default: return 'Easy';
  }
}

/**
 * Convert FirestoreNutrition to existing Recipe NutritionInfo format
 */
function convertFirestoreNutrition(firestoreNutrition?: FirestoreNutrition) {
  if (!firestoreNutrition) return undefined;
  
  return {
    calories: firestoreNutrition.calories || 0,
    protein: firestoreNutrition.protein || 0,
    carbs: firestoreNutrition.carbs || 0,
    fat: firestoreNutrition.fat || 0,
  };
}


/**
 * Generate a unique ingredient ID
 */
function generateIngredientId(): string {
  return `ingredient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
