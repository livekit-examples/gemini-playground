// Demo script showing how to use the new TheMealDB API integration
// This demonstrates the key features and can be run in the browser console

import { mealDBApi } from '@/services/mealdb-api';
import { transformMealDBToRecipes } from '@/utils/mealdb-transformer';
import { recipeCache } from '@/services/recipe-cache';

// Demo functions to showcase the API integration
export class RecipeApiDemo {
  
  // Demo 1: Search for recipes
  static async demoSearch() {
    console.log('🔍 Demo 1: Searching for "chicken" recipes...');
    
    try {
      const meals = await mealDBApi.searchByName('chicken');
      const recipes = transformMealDBToRecipes(meals.slice(0, 3)); // Get first 3
      
      console.log(`Found ${meals.length} meals, showing first 3 transformed recipes:`);
      recipes.forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title}`);
        console.log(`   - Difficulty: ${recipe.difficulty}`);
        console.log(`   - Time: ${recipe.totalTime} minutes`);
        console.log(`   - Ingredients: ${recipe.ingredients.length}`);
        console.log(`   - Steps: ${recipe.steps.length}`);
      });
      
      return recipes;
    } catch (error) {
      console.error('Search demo failed:', error);
      return [];
    }
  }

  // Demo 2: Get random recipes
  static async demoRandomRecipes() {
    console.log('🎲 Demo 2: Getting random recipes...');
    
    try {
      const meals = await mealDBApi.getRandomMeals(5);
      const recipes = transformMealDBToRecipes(meals);
      
      console.log(`Got ${recipes.length} random recipes:`);
      recipes.forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} (${recipe.tags.join(', ')})`);
      });
      
      return recipes;
    } catch (error) {
      console.error('Random recipes demo failed:', error);
      return [];
    }
  }

  // Demo 3: Browse by category
  static async demoCategories() {
    console.log('📂 Demo 3: Browsing categories...');
    
    try {
      const categoriesData = await mealDBApi.getCategories();
      console.log(`Available categories: ${categoriesData.categories.length}`);
      
      // Show first 5 categories
      const firstFiveCategories = categoriesData.categories.slice(0, 5);
      firstFiveCategories.forEach(cat => {
        console.log(`- ${cat.strCategory}: ${cat.strCategoryDescription.substring(0, 100)}...`);
      });
      
      // Get recipes from first category
      const firstCategory = firstFiveCategories[0].strCategory;
      console.log(`\n🍽️ Getting recipes from "${firstCategory}" category...`);
      
      const meals = await mealDBApi.filterByCategory(firstCategory);
      const recipes = transformMealDBToRecipes(meals.slice(0, 3));
      
      recipes.forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} - ${recipe.difficulty}`);
      });
      
      return { categories: categoriesData.categories, recipes };
    } catch (error) {
      console.error('Categories demo failed:', error);
      return { categories: [], recipes: [] };
    }
  }

  // Demo 4: Browse by country/area
  static async demoAreas() {
    console.log('🌍 Demo 4: Browsing by country/area...');
    
    try {
      const areas = await mealDBApi.getAreas();
      console.log(`Available areas: ${areas.length}`);
      console.log(`First 10 areas: ${areas.slice(0, 10).join(', ')}`);
      
      // Get recipes from Italian cuisine
      console.log(`\n🇮🇹 Getting Italian recipes...`);
      const meals = await mealDBApi.filterByArea('Italian');
      const recipes = transformMealDBToRecipes(meals.slice(0, 3));
      
      recipes.forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} - ${recipe.totalTime}min`);
      });
      
      return { areas, recipes };
    } catch (error) {
      console.error('Areas demo failed:', error);
      return { areas: [], recipes: [] };
    }
  }

  // Demo 5: Recipe caching
  static async demoCaching() {
    console.log('💾 Demo 5: Recipe caching...');
    
    try {
      // Get some recipes to cache
      const meals = await mealDBApi.getRandomMeals(3);
      const recipes = transformMealDBToRecipes(meals);
      
      console.log(`Caching ${recipes.length} recipes...`);
      recipeCache.cacheRecipes(recipes);
      
      // Show cache stats
      const stats = recipeCache.getCacheStats();
      console.log(`Cache stats:`, stats);
      
      // Retrieve cached recipes
      console.log('\n📤 Retrieving from cache:');
      const cachedRecipes = recipeCache.getAllCachedRecipes();
      cachedRecipes.forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} (cached)`);
      });
      
      // Test search in cache
      console.log('\n🔍 Searching cache for "chicken":');
      const searchResults = recipeCache.searchCachedRecipes('chicken');
      console.log(`Found ${searchResults.length} cached recipes with "chicken"`);
      
      return { recipes, cachedRecipes, searchResults };
    } catch (error) {
      console.error('Caching demo failed:', error);
      return { recipes: [], cachedRecipes: [], searchResults: [] };
    }
  }

  // Demo 6: Data transformation showcase
  static async demoTransformation() {
    console.log('🔄 Demo 6: Data transformation showcase...');
    
    try {
      // Get a single meal to show transformation
      const meal = await mealDBApi.getRandomMeal();
      if (!meal) {
        console.log('No meal received');
        return null;
      }
      
      console.log('📥 Raw MealDB data:');
      console.log(`- ID: ${meal.idMeal}`);
      console.log(`- Name: ${meal.strMeal}`);
      console.log(`- Category: ${meal.strCategory}`);
      console.log(`- Area: ${meal.strArea}`);
      console.log(`- Instructions length: ${meal.strInstructions.length} characters`);
      console.log(`- Has image: ${!!meal.strMealThumb}`);
      
      // Transform to our format
      const recipe = transformMealDBToRecipes([meal])[0];
      
      console.log('\n📤 Transformed Recipe data:');
      console.log(`- ID: ${recipe.id}`);
      console.log(`- Title: ${recipe.title}`);
      console.log(`- Difficulty: ${recipe.difficulty}`);
      console.log(`- Prep time: ${recipe.prepTime}min`);
      console.log(`- Cook time: ${recipe.cookTime}min`);
      console.log(`- Total time: ${recipe.totalTime}min`);
      console.log(`- Servings: ${recipe.servings}`);
      console.log(`- Ingredients: ${recipe.ingredients.length}`);
      console.log(`- Steps: ${recipe.steps.length}`);
      console.log(`- Tags: ${recipe.tags.join(', ')}`);
      
      // Show ingredient parsing
      console.log('\n🥘 Sample ingredients:');
      recipe.ingredients.slice(0, 5).forEach((ing, index) => {
        console.log(`${index + 1}. ${ing.amount} ${ing.unit} ${ing.name}${ing.notes ? ` (${ing.notes})` : ''}`);
      });
      
      // Show step parsing
      console.log('\n👨‍🍳 Sample cooking steps:');
      recipe.steps.slice(0, 3).forEach((step, index) => {
        console.log(`${index + 1}. ${step.instruction.substring(0, 100)}...`);
        if (step.duration) console.log(`   ⏱️ Duration: ${step.duration} minutes`);
        if (step.tips) console.log(`   💡 Tips: ${step.tips.length}`);
      });
      
      return { originalMeal: meal, transformedRecipe: recipe };
    } catch (error) {
      console.error('Transformation demo failed:', error);
      return null;
    }
  }

  // Run all demos
  static async runAllDemos() {
    console.log('🚀 Running All You Can Cook API Demo Suite...\n');
    
    const results = {
      search: await this.demoSearch(),
      random: await this.demoRandomRecipes(),
      categories: await this.demoCategories(),
      areas: await this.demoAreas(),
      caching: await this.demoCaching(),
      transformation: await this.demoTransformation(),
    };
    
    console.log('\n✅ Demo suite completed!');
    console.log('📊 Summary:');
    console.log(`- Search recipes: ${results.search.length} found`);
    console.log(`- Random recipes: ${results.random.length} loaded`);
    console.log(`- Categories: ${results.categories.categories.length} available`);
    console.log(`- Areas: ${results.areas.areas.length} available`);
    console.log(`- Cached recipes: ${results.caching.cachedRecipes.length} stored`);
    console.log(`- Transformation: ${results.transformation ? 'Success' : 'Failed'}`);
    
    return results;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).RecipeApiDemo = RecipeApiDemo;
  console.log('🍳 Recipe API Demo loaded! Try: RecipeApiDemo.runAllDemos()');
}
