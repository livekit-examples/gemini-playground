import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

/**
 * Debug utility to test Firebase/Firestore connection
 */
export class FirebaseDebug {
  /**
   * Test basic Firestore connection
   */
  static async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      console.log('🔍 Testing Firebase connection...');
      
      // Check if db is initialized
      if (!db) {
        return { success: false, error: 'Firestore not initialized' };
      }
      
      console.log('✅ Firestore instance exists');
      console.log('📋 Firebase config check:', {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
      });
      
      // Try to access a simple collection
      console.log('🔍 Testing collection access...');
      const testCollection = collection(db, 'test');
      console.log('✅ Collection reference created');
      
      // Try to read from recipes collection
      console.log('🔍 Testing recipes collection...');
      const recipesCollection = collection(db, 'recipes');
      const snapshot = await getDocs(recipesCollection);
      
      console.log('✅ Query executed successfully');
      console.log(`📊 Found ${snapshot.size} documents in recipes collection`);
      
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));
      
      return { 
        success: true, 
        details: {
          collectionSize: snapshot.size,
          sampleDocs: docs.slice(0, 2) // First 2 docs for debugging
        }
      };
      
    } catch (error: any) {
      console.error('❌ Firebase connection test failed:', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error',
        details: {
          errorCode: error.code,
          errorMessage: error.message,
          stack: error.stack
        }
      };
    }
  }
  
  /**
   * Test with the v8 style syntax (for comparison)
   */
  static async testV8StyleQuery(): Promise<{ success: boolean; error?: string }> {
    try {
      // This should fail since we're using v9+ SDK
      // @ts-ignore
      const snapshot = await db.collection('recipes').get();
      return { success: true };
    } catch (error: any) {
      console.log('✅ Expected: v8 syntax failed (this is correct for v9+ SDK)');
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Check environment variables
   */
  static checkEnvironment(): Record<string, any> {
    return {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set (hidden)' : 'Missing',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Missing',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Missing',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'Missing',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'Missing',
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set (hidden)' : 'Missing',
    };
  }
}
