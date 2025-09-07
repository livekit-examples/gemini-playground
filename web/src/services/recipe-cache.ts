// Recipe caching service for offline access
// Stores recipes in localStorage and IndexedDB for better performance

import { Recipe } from '@/data/recipe-types';

interface CachedRecipe {
  recipe: Recipe;
  cachedAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  totalRecipes: number;
  cacheSize: number; // in bytes (approximate)
  oldestCache: number;
  newestCache: number;
}

class RecipeCacheService {
  private readonly CACHE_KEY = 'recipe-cache';
  private readonly MAX_CACHE_SIZE = 100; // Maximum number of recipes to cache
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private cache: Map<string, CachedRecipe> = new Map();

  constructor() {
    // Only load cache if we're in the browser
    if (typeof window !== 'undefined') {
      this.loadCacheFromStorage();
    }
  }

  // Check if we're in browser environment
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Load cache from localStorage on initialization
  private loadCacheFromStorage(): void {
    if (!this.isBrowser()) return;
    
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const cacheData = JSON.parse(cached);
        this.cache = new Map(Object.entries(cacheData).map(([key, value]) => [
          key,
          {
            ...(value as CachedRecipe),
            recipe: {
              ...(value as CachedRecipe).recipe,
              createdAt: new Date((value as CachedRecipe).recipe.createdAt),
              updatedAt: new Date((value as CachedRecipe).recipe.updatedAt),
            }
          }
        ]));
        
        // Clean up expired entries
        this.cleanupExpiredEntries();
      }
    } catch (error) {
      console.warn('Failed to load recipe cache:', error);
      this.cache.clear();
    }
  }

  // Save cache to localStorage
  private saveCacheToStorage(): void {
    if (!this.isBrowser()) return;
    
    try {
      const cacheObject = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Failed to save recipe cache:', error);
      // If localStorage is full, try to make space
      this.evictOldestEntries(10);
      try {
        const cacheObject = Object.fromEntries(this.cache.entries());
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheObject));
      } catch (retryError) {
        console.error('Failed to save recipe cache after cleanup:', retryError);
      }
    }
  }

  // Clean up expired cache entries
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    const entries = Array.from(this.cache.entries());
    for (const [key, cached] of entries) {
      if (now - cached.cachedAt > this.CACHE_DURATION) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired recipe cache entries`);
      this.saveCacheToStorage();
    }
  }

  // Evict oldest entries when cache is full
  private evictOldestEntries(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
      .slice(0, count);

    entries.forEach(([key]) => this.cache.delete(key));
    
    if (entries.length > 0) {
      console.log(`Evicted ${entries.length} old recipe cache entries`);
    }
  }

  // Cache a single recipe
  cacheRecipe(recipe: Recipe): void {
    // Check if we need to make space
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestEntries(Math.ceil(this.MAX_CACHE_SIZE * 0.1)); // Remove 10% of cache
    }

    const now = Date.now();
    const existing = this.cache.get(recipe.id);

    const cachedRecipe: CachedRecipe = {
      recipe,
      cachedAt: existing?.cachedAt || now,
      accessCount: (existing?.accessCount || 0) + 1,
      lastAccessed: now,
    };

    this.cache.set(recipe.id, cachedRecipe);
    this.saveCacheToStorage();
  }

  // Cache multiple recipes
  cacheRecipes(recipes: Recipe[]): void {
    recipes.forEach(recipe => this.cacheRecipe(recipe));
  }

  // Get a cached recipe
  getCachedRecipe(recipeId: string): Recipe | null {
    const cached = this.cache.get(recipeId);
    
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() - cached.cachedAt > this.CACHE_DURATION) {
      this.cache.delete(recipeId);
      this.saveCacheToStorage();
      return null;
    }

    // Update access stats
    cached.accessCount++;
    cached.lastAccessed = Date.now();
    this.saveCacheToStorage();

    return cached.recipe;
  }

  // Get multiple cached recipes
  getCachedRecipes(recipeIds: string[]): Recipe[] {
    return recipeIds
      .map(id => this.getCachedRecipe(id))
      .filter((recipe): recipe is Recipe => recipe !== null);
  }

  // Get all cached recipes
  getAllCachedRecipes(): Recipe[] {
    this.cleanupExpiredEntries();
    return Array.from(this.cache.values())
      .sort((a, b) => b.lastAccessed - a.lastAccessed) // Most recently accessed first
      .map(cached => cached.recipe);
  }

  // Get recently accessed recipes
  getRecentRecipes(limit: number = 10): Recipe[] {
    this.cleanupExpiredEntries();
    return Array.from(this.cache.values())
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, limit)
      .map(cached => cached.recipe);
  }

  // Get most popular recipes (by access count)
  getPopularRecipes(limit: number = 10): Recipe[] {
    this.cleanupExpiredEntries();
    return Array.from(this.cache.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit)
      .map(cached => cached.recipe);
  }

  // Search cached recipes
  searchCachedRecipes(query: string): Recipe[] {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    this.cleanupExpiredEntries();

    return Array.from(this.cache.values())
      .filter(cached => {
        const recipe = cached.recipe;
        return (
          recipe.title.toLowerCase().includes(searchTerm) ||
          recipe.description.toLowerCase().includes(searchTerm) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm))
        );
      })
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .map(cached => cached.recipe);
  }

  // Check if a recipe is cached
  isRecipeCached(recipeId: string): boolean {
    const cached = this.cache.get(recipeId);
    if (!cached) return false;
    
    // Check if expired
    if (Date.now() - cached.cachedAt > this.CACHE_DURATION) {
      this.cache.delete(recipeId);
      this.saveCacheToStorage();
      return false;
    }
    
    return true;
  }

  // Remove a recipe from cache
  removeCachedRecipe(recipeId: string): boolean {
    const deleted = this.cache.delete(recipeId);
    if (deleted) {
      this.saveCacheToStorage();
    }
    return deleted;
  }

  // Clear all cached recipes
  clearCache(): void {
    this.cache.clear();
    if (this.isBrowser()) {
      localStorage.removeItem(this.CACHE_KEY);
    }
  }

  // Get cache statistics
  getCacheStats(): CacheStats {
    this.cleanupExpiredEntries();
    
    const entries = Array.from(this.cache.values());
    const cacheString = JSON.stringify(Object.fromEntries(this.cache.entries()));
    
    return {
      totalRecipes: entries.length,
      cacheSize: new Blob([cacheString]).size,
      oldestCache: entries.length > 0 ? Math.min(...entries.map(e => e.cachedAt)) : 0,
      newestCache: entries.length > 0 ? Math.max(...entries.map(e => e.cachedAt)) : 0,
    };
  }

  // Get recipes by category from cache
  getCachedRecipesByCategory(category: string): Recipe[] {
    this.cleanupExpiredEntries();
    return Array.from(this.cache.values())
      .filter(cached => 
        cached.recipe.tags.some(tag => 
          tag.toLowerCase() === category.toLowerCase()
        )
      )
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .map(cached => cached.recipe);
  }

  // Get recipes by difficulty from cache
  getCachedRecipesByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Recipe[] {
    this.cleanupExpiredEntries();
    return Array.from(this.cache.values())
      .filter(cached => cached.recipe.difficulty === difficulty)
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .map(cached => cached.recipe);
  }

  // Export cache for backup
  exportCache(): string {
    return JSON.stringify(Object.fromEntries(this.cache.entries()));
  }

  // Import cache from backup
  importCache(cacheData: string): boolean {
    try {
      const parsed = JSON.parse(cacheData);
      this.cache.clear();
      
      for (const [key, value] of Object.entries(parsed)) {
        this.cache.set(key, {
          ...(value as CachedRecipe),
          recipe: {
            ...(value as CachedRecipe).recipe,
            createdAt: new Date((value as CachedRecipe).recipe.createdAt),
            updatedAt: new Date((value as CachedRecipe).recipe.updatedAt),
          }
        });
      }
      
      this.saveCacheToStorage();
      return true;
    } catch (error) {
      console.error('Failed to import cache:', error);
      return false;
    }
  }
}

// Export singleton instance
export const recipeCache = new RecipeCacheService();

// Export hook for React components - client-side only
export function useRecipeCache() {
  // Only initialize cache operations on the client side
  const isBrowser = typeof window !== 'undefined';
  
  return {
    cacheRecipe: (recipe: Recipe) => {
      if (isBrowser) recipeCache.cacheRecipe(recipe);
    },
    cacheRecipes: (recipes: Recipe[]) => {
      if (isBrowser) recipeCache.cacheRecipes(recipes);
    },
    getCachedRecipe: (id: string) => {
      return isBrowser ? recipeCache.getCachedRecipe(id) : null;
    },
    getCachedRecipes: (ids: string[]) => {
      return isBrowser ? recipeCache.getCachedRecipes(ids) : [];
    },
    getAllCachedRecipes: () => {
      return isBrowser ? recipeCache.getAllCachedRecipes() : [];
    },
    getRecentRecipes: (limit?: number) => {
      return isBrowser ? recipeCache.getRecentRecipes(limit) : [];
    },
    getPopularRecipes: (limit?: number) => {
      return isBrowser ? recipeCache.getPopularRecipes(limit) : [];
    },
    searchCachedRecipes: (query: string) => {
      return isBrowser ? recipeCache.searchCachedRecipes(query) : [];
    },
    isRecipeCached: (id: string) => {
      return isBrowser ? recipeCache.isRecipeCached(id) : false;
    },
    removeCachedRecipe: (id: string) => {
      return isBrowser ? recipeCache.removeCachedRecipe(id) : false;
    },
    clearCache: () => {
      if (isBrowser) recipeCache.clearCache();
    },
    getCacheStats: () => {
      return isBrowser ? recipeCache.getCacheStats() : { totalRecipes: 0, cacheSize: 0, oldestCache: 0, newestCache: 0 };
    },
    getCachedRecipesByCategory: (category: string) => {
      return isBrowser ? recipeCache.getCachedRecipesByCategory(category) : [];
    },
    getCachedRecipesByDifficulty: (difficulty: 'Easy' | 'Medium' | 'Hard') => {
      return isBrowser ? recipeCache.getCachedRecipesByDifficulty(difficulty) : [];
    },
  };
}
