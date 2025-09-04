import { Recipe } from "./recipe-types";

// Hardcoded recipes for All You Can Cook
// In the future, these will be loaded from a database

export const hardcodedRecipes: Recipe[] = [
  {
    id: "perfect-fried-egg",
    title: "Perfect Fried Egg",
    description: "Learn to make the perfect fried egg with a runny yolk and crispy edges. Simple, quick, and delicious!",
    servings: 1,
    prepTime: 2,
    cookTime: 4,
    totalTime: 6,
    difficulty: 'Easy',
    ingredients: [
      {
        id: "egg",
        name: "Large egg",
        amount: 1,
        unit: "whole",
        notes: "Fresh, room temperature preferred",
        category: 'protein'
      },
      {
        id: "oil",
        name: "Cooking oil",
        amount: 1,
        unit: "tsp",
        notes: "Vegetable oil, canola, or butter",
        category: 'other'
      },
      {
        id: "salt",
        name: "Salt",
        amount: 1,
        unit: "pinch",
        notes: "To taste",
        category: 'spice'
      },
      {
        id: "pepper",
        name: "Black pepper",
        amount: 1,
        unit: "pinch",
        notes: "Freshly ground, to taste",
        category: 'spice',
        optional: true
      }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "Heat a non-stick or well-seasoned pan over medium-low heat. Add oil and let it warm up.",
        duration: 1,
        ingredients: ["oil"],
        tips: ["Medium-low heat prevents the egg from cooking too quickly", "The pan is ready when the oil shimmers slightly"],
        equipment: ["Non-stick pan", "Spatula"]
      },
      {
        stepNumber: 2,
        instruction: "Crack the egg into a small bowl first, then gently pour it into the center of the pan.",
        ingredients: ["egg"],
        tips: ["Cracking into a bowl first prevents broken yolks", "Pour from low height to avoid splashing", "The egg should sizzle gently when it hits the pan"],
        equipment: ["Small bowl"]
      },
      {
        stepNumber: 3,
        instruction: "Let the egg cook undisturbed for 2-3 minutes until the whites are mostly set but still slightly translucent on top.",
        duration: 3,
        tips: ["Don't move or flip the egg yet", "The edges should start to look crispy and golden", "The yolk should still be completely runny"]
      },
      {
        stepNumber: 4,
        instruction: "Season with salt and pepper. For sunny-side up, cook 30 seconds more. For over-easy, carefully flip and cook 30 seconds.",
        duration: 1,
        ingredients: ["salt", "pepper"],
        tips: ["For over-easy: slide spatula under the egg gently and flip in one smooth motion", "The yolk should jiggle slightly when done"],
        equipment: ["Spatula"]
      },
      {
        stepNumber: 5,
        instruction: "Slide the egg onto your plate and serve immediately. Enjoy your perfect fried egg!",
        tips: ["Serve on warm toast or with breakfast sides", "The yolk should be golden and runny when cut"]
      }
    ],
    tags: ["Breakfast", "Quick", "Easy", "Protein", "Basic Cooking"],
    nutrition: {
      calories: 90,
      protein: 6,
      carbs: 1,
      fat: 7,
      fiber: 0,
      sodium: 70
    },
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400",
    author: "All You Can Cook",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    id: "classic-egg-fried-rice",
    title: "Classic Egg Fried Rice",
    description: "Restaurant-style egg fried rice made at home. Simple ingredients, incredible flavor, and ready in minutes!",
    servings: 2,
    prepTime: 10,
    cookTime: 8,
    totalTime: 18,
    difficulty: 'Easy',
    ingredients: [
      {
        id: "cooked-rice",
        name: "Cooked rice",
        amount: 2,
        unit: "cups",
        notes: "Day-old rice works best, cooled completely",
        category: 'grain'
      },
      {
        id: "eggs",
        name: "Large eggs",
        amount: 2,
        unit: "whole",
        notes: "Beaten well",
        category: 'protein'
      },
      {
        id: "cooking-oil",
        name: "Vegetable oil",
        amount: 3,
        unit: "tbsp",
        notes: "Divided - 1 tbsp for eggs, 2 tbsp for rice",
        category: 'other'
      },
      {
        id: "garlic",
        name: "Garlic",
        amount: 2,
        unit: "cloves",
        notes: "Minced",
        category: 'vegetable'
      },
      {
        id: "green-onions",
        name: "Green onions",
        amount: 3,
        unit: "stalks",
        notes: "Chopped, white and green parts separated",
        category: 'vegetable'
      },
      {
        id: "soy-sauce",
        name: "Soy sauce",
        amount: 2,
        unit: "tbsp",
        notes: "Light soy sauce preferred",
        category: 'other'
      },
      {
        id: "sesame-oil",
        name: "Sesame oil",
        amount: 1,
        unit: "tsp",
        notes: "For finishing",
        category: 'other'
      },
      {
        id: "salt",
        name: "Salt",
        amount: 1,
        unit: "pinch",
        notes: "To taste",
        category: 'spice'
      },
      {
        id: "white-pepper",
        name: "White pepper",
        amount: 1,
        unit: "pinch",
        notes: "To taste, or black pepper",
        category: 'spice',
        optional: true
      }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "Heat 1 tablespoon oil in a wok or large pan over high heat. Pour in beaten eggs and scramble until just set. Remove and set aside.",
        duration: 2,
        ingredients: ["cooking-oil", "eggs"],
        tips: ["High heat is key for good fried rice", "Don't overcook the eggs - they'll cook more later", "Break eggs into small, fluffy pieces"],
        equipment: ["Wok or large pan", "Spatula"]
      },
      {
        stepNumber: 2,
        instruction: "Add remaining 2 tablespoons oil to the same pan. Add minced garlic and white parts of green onions. Stir-fry for 30 seconds until fragrant.",
        duration: 1,
        ingredients: ["cooking-oil", "garlic", "green-onions"],
        tips: ["Don't let garlic burn - it will taste bitter", "The oil should be hot and sizzling", "White parts of green onions add great flavor"],
        equipment: ["Spatula"]
      },
      {
        stepNumber: 3,
        instruction: "Add the cold rice, breaking up any clumps with your spatula. Stir-fry for 3-4 minutes until heated through and slightly crispy.",
        duration: 4,
        ingredients: ["cooked-rice"],
        tips: ["Day-old rice works best - it's drier and won't get mushy", "Keep stirring to prevent sticking", "Some rice should get a bit golden and crispy"],
        equipment: ["Spatula"]
      },
      {
        stepNumber: 4,
        instruction: "Return scrambled eggs to the pan. Add soy sauce and mix everything together. Stir-fry for 1-2 minutes.",
        duration: 2,
        ingredients: ["soy-sauce"],
        tips: ["Add soy sauce gradually to avoid over-salting", "Mix well so every grain is coated", "The rice should have a light golden color from the soy sauce"],
        equipment: ["Spatula"]
      },
      {
        stepNumber: 5,
        instruction: "Remove from heat. Add sesame oil, green parts of green onions, salt, and pepper. Toss well and serve immediately.",
        ingredients: ["sesame-oil", "green-onions", "salt", "white-pepper"],
        tips: ["Sesame oil burns easily, so add it off the heat", "Green onion tops add fresh color and mild onion flavor", "Taste and adjust seasoning as needed"],
        equipment: ["Serving bowls"]
      }
    ],
    tags: ["Chinese", "Rice", "Quick", "Easy", "Comfort Food", "One Pan"],
    nutrition: {
      calories: 320,
      protein: 12,
      carbs: 45,
      fat: 11,
      fiber: 2,
      sodium: 680
    },
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
    author: "All You Can Cook",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Helper function to get recipe by ID
export function getRecipeById(id: string): Recipe | undefined {
  return hardcodedRecipes.find(recipe => recipe.id === id);
}

// Helper function to get all available recipes
export function getAllRecipes(): Recipe[] {
  return hardcodedRecipes;
}
