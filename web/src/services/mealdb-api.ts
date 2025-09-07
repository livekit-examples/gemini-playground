// TheMealDB API service
// Handles all interactions with the TheMealDB API

import {
  MealDBMeal,
  MealDBMealPreview,
  MealDBSearchResponse,
  MealDBCategoriesResponse,
  MealDBAreasResponse,
  MealDBIngredientsResponse,
  MealDBMealPreviewResponse,
  MEALDB_ENDPOINTS,
  RecipeSearchFilters,
} from '@/types/mealdb-api';

class MealDBApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'MealDBApiError';
  }
}

class MealDBApiService {
  private baseUrl = MEALDB_ENDPOINTS.BASE_URL;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private async fetchWithCache<T>(endpoint: string): Promise<T> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new MealDBApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data as T;
    } catch (error) {
      if (error instanceof MealDBApiError) {
        throw error;
      }
      throw new MealDBApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search meals by name
  async searchByName(name: string): Promise<MealDBMeal[]> {
    if (!name.trim()) return [];
    
    const response = await this.fetchWithCache<MealDBSearchResponse>(
      MEALDB_ENDPOINTS.SEARCH_BY_NAME(name.trim())
    );
    
    return response.meals || [];
  }

  // Search meals by first letter
  async searchByLetter(letter: string): Promise<MealDBMeal[]> {
    if (!letter || letter.length !== 1) return [];
    
    const response = await this.fetchWithCache<MealDBSearchResponse>(
      MEALDB_ENDPOINTS.SEARCH_BY_LETTER(letter.toLowerCase())
    );
    
    return response.meals || [];
  }

  // Get meal details by ID
  async getMealById(id: string): Promise<MealDBMeal | null> {
    if (!id) return null;
    
    const response = await this.fetchWithCache<MealDBSearchResponse>(
      MEALDB_ENDPOINTS.LOOKUP_BY_ID(id)
    );
    
    return response.meals?.[0] || null;
  }

  // Get a random meal
  async getRandomMeal(): Promise<MealDBMeal | null> {
    // Don't cache random meals
    try {
      const response = await fetch(`${this.baseUrl}${MEALDB_ENDPOINTS.RANDOM_MEAL}`);
      
      if (!response.ok) {
        throw new MealDBApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data: MealDBSearchResponse = await response.json();
      return data.meals?.[0] || null;
    } catch (error) {
      if (error instanceof MealDBApiError) {
        throw error;
      }
      throw new MealDBApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get multiple random meals (simulate since we don't have premium API)
  async getRandomMeals(count: number = 6): Promise<MealDBMeal[]> {
    const meals: MealDBMeal[] = [];
    const promises: Promise<MealDBMeal | null>[] = [];
    
    for (let i = 0; i < count; i++) {
      promises.push(this.getRandomMeal());
    }
    
    try {
      const results = await Promise.all(promises);
      return results.filter((meal): meal is MealDBMeal => meal !== null);
    } catch (error) {
      console.warn('Some random meals failed to load:', error);
      return meals;
    }
  }

  // Get all categories
  async getCategories(): Promise<MealDBCategoriesResponse> {
    return this.fetchWithCache<MealDBCategoriesResponse>(MEALDB_ENDPOINTS.CATEGORIES);
  }

  // Get all areas/countries
  async getAreas(): Promise<string[]> {
    const response = await this.fetchWithCache<MealDBAreasResponse>(MEALDB_ENDPOINTS.LIST_AREAS);
    return response.meals.map(area => area.strArea);
  }

  // Get all ingredients
  async getIngredients(): Promise<string[]> {
    const response = await this.fetchWithCache<MealDBIngredientsResponse>(MEALDB_ENDPOINTS.LIST_INGREDIENTS);
    return response.meals.map(ingredient => ingredient.strIngredient);
  }

  // Filter meals by ingredient
  async filterByIngredient(ingredient: string): Promise<MealDBMeal[]> {
    if (!ingredient.trim()) return [];
    
    const previewResponse = await this.fetchWithCache<MealDBMealPreviewResponse>(
      MEALDB_ENDPOINTS.FILTER_BY_INGREDIENT(ingredient.trim())
    );
    
    if (!previewResponse.meals) return [];
    
    // Get full details for all meals (no limit - we'll paginate on the client side)
    const mealIds = previewResponse.meals.map(meal => meal.idMeal);
    const detailPromises = mealIds.map(id => this.getMealById(id));
    
    try {
      const detailedMeals = await Promise.all(detailPromises);
      return detailedMeals.filter((meal): meal is MealDBMeal => meal !== null);
    } catch (error) {
      console.warn('Some meal details failed to load:', error);
      return [];
    }
  }

  // Filter meals by category (returns preview data only)
  async filterByCategory(category: string): Promise<MealDBMealPreview[]> {
    if (!category.trim()) return [];
    
    const previewResponse = await this.fetchWithCache<MealDBMealPreviewResponse>(
      MEALDB_ENDPOINTS.FILTER_BY_CATEGORY(category.trim())
    );
    
    return previewResponse.meals || [];
  }

  // Filter meals by area/country (returns preview data only)
  async filterByArea(area: string): Promise<MealDBMealPreview[]> {
    if (!area.trim()) return [];
    
    const previewResponse = await this.fetchWithCache<MealDBMealPreviewResponse>(
      MEALDB_ENDPOINTS.FILTER_BY_AREA(area.trim())
    );
    
    return previewResponse.meals || [];
  }

  // Generic search with filters (returns full meal details)
  async searchMeals(filters: RecipeSearchFilters): Promise<MealDBMeal[]> {
    if (filters.query) {
      return this.searchByName(filters.query);
    } else if (filters.letter) {
      return this.searchByLetter(filters.letter);
    } else if (filters.ingredient) {
      return this.filterByIngredient(filters.ingredient);
    }
    
    // For category and area, we now return previews, so this method doesn't support them
    // Use filterByCategory or filterByArea directly for preview data
    return [];
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats (for debugging)
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const mealDBApi = new MealDBApiService();
export { MealDBApiError };
