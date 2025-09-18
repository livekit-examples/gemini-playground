import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  limit,
  where
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { FirestoreRecipe, COLLECTIONS } from '@/types/firestore-types';
import { firestoreRecipeToRecipe } from '@/utils/recipe-converters';
import { Recipe } from '@/data/recipe-types';

export class SignatureRecipeService {
  private static collectionName = COLLECTIONS.RECIPES;

  /**
   * Get signature recipes from Firestore
   * These are curated recipes marked as signature dishes
   */
  static async getSignatureRecipes(limitCount: number = 10): Promise<Recipe[]> {
    try {
      console.log('🔍 Loading signature recipes from Firestore...');
      console.log('📊 Collection:', this.collectionName, 'Limit:', limitCount);
      
      // Check if db is available
      if (!db) {
        throw new Error('Firestore not initialized');
      }
      
      // Query for signature recipes - simplified query first to test connection
      // NOTE: orderBy requires an index in Firestore, let's try without it first
      const q = query(
        collection(db, this.collectionName),
        limit(limitCount)
        // Commented out orderBy to avoid index requirement for now
        // orderBy('create_date', 'desc'),
        // You can add: where('signature', '==', true) if you add a signature field
        // Or: where('author', '==', 'system') for system-created recipes
      );
      
      console.log('📋 Executing Firestore query...');
      const querySnapshot = await getDocs(q);
      console.log('✅ Query successful, found', querySnapshot.size, 'documents');
      
      if (querySnapshot.empty) {
        console.log('ℹ️ No signature recipes found in Firestore');
        return [];
      }
      
      const firestoreRecipes: FirestoreRecipe[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          create_date: data.create_date?.toDate() || new Date(),
        } as FirestoreRecipe;
      });

      console.log('🔄 Converting', firestoreRecipes.length, 'Firestore recipes to Recipe format...');
      // Convert to existing Recipe format
      const convertedRecipes = firestoreRecipes.map(firestoreRecipeToRecipe);
      console.log('✅ Successfully converted signature recipes:', convertedRecipes.length);
      
      return convertedRecipes;
    } catch (error: any) {
      console.error('❌ Error getting signature recipes:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw new Error(`Failed to load signature recipes: ${error.message}`);
    }
  }

  /**
   * Get featured signature recipes (subset of signature recipes)
   */
  static async getFeaturedSignatureRecipes(limitCount: number = 6): Promise<Recipe[]> {
    try {
      // Get a smaller set of featured recipes
      return await this.getSignatureRecipes(limitCount);
    } catch (error) {
      console.error('Error getting featured signature recipes:', error);
      throw new Error('Failed to load featured signature recipes');
    }
  }

  /**
   * Check if the service is available (Firebase is configured)
   */
  static isAvailable(): boolean {
    try {
      return !!db;
    } catch {
      return false;
    }
  }
}
