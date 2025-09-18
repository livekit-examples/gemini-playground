// Firestore Recipe Types based on the provided schema

export type IngredientTag = 
  | 'protein' 
  | 'vegetable' 
  | 'dairy' 
  | 'grain' 
  | 'spice' 
  | 'herb' 
  | 'fruit' 
  | 'nuts' 
  | 'oil' 
  | 'seasoning';

export interface FirestoreIngredient {
  name: string;
  amount_from: number;
  amount_to?: number;
  unit: string;
  optional: boolean;
  tags?: IngredientTag[];
}

export interface FirestoreStep {
  number: number;
  instruction: string;
  equipment?: string[];
  optional?: boolean;
}

export type TagCategory = 
  | 'country' 
  | 'ingredient' 
  | 'style' 
  | 'dietary' 
  | 'cuisine' 
  | 'meal_type' 
  | 'cooking_method';

export interface FirestoreTag {
  category: TagCategory;
  value: string; // e.g., "China", "Japan", "Vegetarian", "Breakfast", etc.
}

export interface FirestoreNutrition {
  calories?: number;
  protein?: number; // in grams
  carbs?: number; // in grams  
  fat?: number; // in grams
  fiber?: number; // in grams
  sugar?: number; // in grams
  sodium?: number; // in milligrams
  cholesterol?: number; // in milligrams
  saturated_fat?: number; // in grams
  trans_fat?: number; // in grams
  vitamin_a?: number; // in IU or mcg
  vitamin_c?: number; // in mg
  calcium?: number; // in mg
  iron?: number; // in mg
}

export interface FirestoreRecipe {
  id: string; // uuid
  title: string;
  description: string;
  ingredients: FirestoreIngredient[];
  steps: FirestoreStep[];
  serving: number; // Number of people
  total_time: number; // Total cooking time in minutes
  nutrition_info?: FirestoreNutrition;
  difficulty: number; // Starting from 1 (simplest)
  imageUrl: string;
  tags?: FirestoreTag[];
  author?: string; // Author's user id, using uuid.Zero for system created recipes
  create_date: Date; // Firestore timestamp
  version: number; // version of this recipe
  original_recipe_id?: string; // Id of original recipe
}

// For creating new recipes (some fields auto-generated)
export interface CreateFirestoreRecipe {
  title: string;
  description: string;
  ingredients: FirestoreIngredient[];
  steps: FirestoreStep[];
  serving: number;
  total_time: number;
  nutrition_info?: FirestoreNutrition;
  difficulty: number;
  imageUrl: string;
  tags?: FirestoreTag[];
  author?: string;
  original_recipe_id?: string;
}

// For updating existing recipes (all fields optional except id)
export interface UpdateFirestoreRecipe {
  id: string;
  title?: string;
  description?: string;
  ingredients?: FirestoreIngredient[];
  steps?: FirestoreStep[];
  serving?: number;
  total_time?: number;
  nutrition_info?: FirestoreNutrition;
  difficulty?: number;
  imageUrl?: string;
  tags?: FirestoreTag[];
  author?: string;
  original_recipe_id?: string;
}

// For recipe queries and filters
export interface RecipeQuery {
  tags?: FirestoreTag[];
  difficulty_max?: number;
  total_time_max?: number;
  serving_min?: number;
  serving_max?: number;
  author?: string;
  search_text?: string;
}

// Firestore collection names
export const COLLECTIONS = {
  RECIPES: 'recipes',
  USERS: 'users',
} as const;
