"use client";

import { useState, useEffect, useCallback } from 'react';
import { Recipe } from '@/data/recipe-types';
import { SignatureRecipeService } from '@/services/signature-recipe-service';

export interface UseSignatureRecipesReturn {
  // State
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  isAvailable: boolean;
  
  // Actions
  loadSignatureRecipes: () => Promise<void>;
  loadFeaturedRecipes: () => Promise<void>;
  refreshRecipes: () => Promise<void>;
}

export function useSignatureRecipes(): UseSignatureRecipesReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable] = useState(SignatureRecipeService.isAvailable());

  /**
   * Load signature recipes from Firestore
   */
  const loadSignatureRecipes = useCallback(async (): Promise<void> => {
    if (!isAvailable) {
      setError('Firebase not configured');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const signatureRecipes = await SignatureRecipeService.getSignatureRecipes(12);
      setRecipes(signatureRecipes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load signature recipes';
      setError(errorMessage);
      console.error('Error loading signature recipes:', err);
      // Set empty array on error so UI can fall back gracefully
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [isAvailable]);

  /**
   * Load featured signature recipes (smaller subset)
   */
  const loadFeaturedRecipes = useCallback(async (): Promise<void> => {
    if (!isAvailable) {
      setError('Firebase not configured');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const featuredRecipes = await SignatureRecipeService.getFeaturedSignatureRecipes(6);
      setRecipes(featuredRecipes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load featured recipes';
      setError(errorMessage);
      console.error('Error loading featured recipes:', err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [isAvailable]);

  /**
   * Refresh current recipes
   */
  const refreshRecipes = useCallback(async (): Promise<void> => {
    await loadSignatureRecipes();
  }, [loadSignatureRecipes]);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    if (isAvailable) {
      loadSignatureRecipes();
    } else {
      console.warn('Firebase not available, signature recipes will not load');
    }
  }, [isAvailable, loadSignatureRecipes]);

  return {
    // State
    recipes,
    loading,
    error,
    isAvailable,
    
    // Actions
    loadSignatureRecipes,
    loadFeaturedRecipes,
    refreshRecipes,
  };
}
