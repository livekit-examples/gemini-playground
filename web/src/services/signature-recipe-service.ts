import { 
  collection, 
  getDocs, 
  query, 
  limit
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
      // Check if db is available
      if (!db) {
        throw new Error('Firestore not initialized');
      }
      
      // Query for signature recipes
      const q = query(
        collection(db, this.collectionName),
        limit(limitCount)
        // Note: orderBy requires an index in Firestore
        // You can add: where('signature', '==', true) if you add a signature field
        // Or: where('author', '==', 'system') for system-created recipes
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const firestoreRecipes: FirestoreRecipe[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          create_date: data.create_date?.toDate() || new Date(),
        } as FirestoreRecipe;
      });

      // Convert to existing Recipe format
      const convertedRecipes = firestoreRecipes.map(firestoreRecipeToRecipe);
      console.log('✅ Successfully loaded signature recipes:', convertedRecipes.length);
      
      return convertedRecipes;
    } catch (error: any) {
      console.error('Error loading signature recipes:', error);
      throw new Error(`Failed to load signature recipes: ${error.message}`);
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
