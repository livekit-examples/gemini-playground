// Recipe data types for All You Can Cook
// All recipe management is handled in the frontend

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings?: number; // Optional - not provided by all APIs
  prepTime?: number; // minutes - Optional - not provided by all APIs
  cookTime?: number; // minutes - Optional - not provided by all APIs
  totalTime?: number; // minutes (calculated: prepTime + cookTime) - Optional
  difficulty?: 'Easy' | 'Medium' | 'Hard'; // Optional - not provided by all APIs
  ingredients: Ingredient[];
  instructions: string; // Single instruction string (simplified from CookingStep array)
  tags: string[];
  nutrition?: NutritionInfo;
  imageUrl?: string;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional fields for API integration
  category?: string; // e.g., "Dessert", "Main Course"
  cuisine?: string; // e.g., "Italian", "Chinese"
  source?: string; // e.g., "TheMealDB", "User Created"
  sourceUrl?: string; // URL to original recipe
  isPreview?: boolean; // True if this is a preview with limited data
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
  optional?: boolean;
  category?: 'protein' | 'vegetable' | 'dairy' | 'grain' | 'spice' | 'other';
}

export interface CookingStep {
  stepNumber: number;
  instruction: string;
  duration?: number; // minutes
  temperature?: number; // celsius
  tips?: string[];
  ingredients?: string[]; // ingredient IDs used in this step
  equipment?: string[];
  imageUrl?: string;
}

export interface NutritionInfo {
  calories?: number;
  protein?: number; // grams
  carbs?: number; // grams
  fat?: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // milligrams
}

export interface CookingSession {
  id: string;
  recipeId: string;
  currentStep: number;
  startedAt: Date;
  completedSteps: number[];
  activeTimers: CookingTimer[];
  notes: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
}

export interface CookingTimer {
  id: string;
  name: string;
  duration: number; // seconds
  remainingTime: number; // seconds
  isActive: boolean;
  stepNumber?: number;
  createdAt: Date;
}

// Recipe context for AI assistant
export interface RecipeContext {
  recipe: Recipe;
  currentStep: number;
  completedSteps: number[];
  activeTimers: CookingTimer[];
  sessionNotes: string;
}

// Sample recipe for development/testing
export const sampleRecipe: Recipe = {
  id: "sample-pasta-carbonara",
  title: "Classic Pasta Carbonara",
  description: "A creamy, authentic Italian pasta dish with eggs, cheese, pancetta, and black pepper.",
  servings: 4,
  prepTime: 15,
  cookTime: 20,
  totalTime: 35,
  difficulty: 'Medium',
  ingredients: [
    {
      id: "pasta",
      name: "Spaghetti or linguine",
      amount: 400,
      unit: "g",
      category: 'grain'
    },
    {
      id: "pancetta",
      name: "Pancetta",
      amount: 150,
      unit: "g",
      notes: "Diced into small cubes",
      category: 'protein'
    },
    {
      id: "eggs",
      name: "Large eggs",
      amount: 3,
      unit: "whole",
      category: 'protein'
    },
    {
      id: "egg-yolk",
      name: "Egg yolk",
      amount: 1,
      unit: "whole",
      category: 'protein'
    },
    {
      id: "parmesan",
      name: "Parmesan cheese",
      amount: 100,
      unit: "g",
      notes: "Freshly grated",
      category: 'dairy'
    },
    {
      id: "black-pepper",
      name: "Black pepper",
      amount: 1,
      unit: "tsp",
      notes: "Freshly ground",
      category: 'spice'
    },
    {
      id: "salt",
      name: "Salt",
      amount: 1,
      unit: "tsp",
      notes: "For pasta water",
      category: 'spice'
    }
  ],
  instructions: "1. Bring a large pot of salted water to boil. Add pasta and cook according to package directions until al dente.\n\n2. While pasta cooks, dice the pancetta into small cubes and cook in a large pan over medium heat until crispy.\n\n3. In a bowl, whisk together the whole eggs, egg yolk, grated Parmesan, and freshly ground black pepper.\n\n4. Reserve 1 cup of pasta cooking water, then drain the pasta. Immediately add hot pasta to the pan with pancetta.\n\n5. Remove pan from heat. Quickly add the egg mixture while tossing the pasta vigorously. Add pasta water gradually until creamy.\n\n6. Serve immediately with extra Parmesan and black pepper. Enjoy your authentic carbonara!",
  tags: ["Italian", "Pasta", "Quick", "Comfort Food", "Traditional"],
  nutrition: {
    calories: 520,
    protein: 28,
    carbs: 45,
    fat: 22,
    fiber: 2,
    sodium: 850
  },
  author: "All You Can Cook",
  createdAt: new Date(),
  updatedAt: new Date()
};
