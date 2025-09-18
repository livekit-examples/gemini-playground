/**
 * Script to add signature recipe to Firestore with authentication
 * Run with: pnpm add-signature-recipe
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { config } from 'dotenv';
import { FirestoreRecipe } from '../src/types/firestore-types';

// Load environment variables
config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'aycc-test');
const auth = getAuth(app);

// Admin credentials - you can set these as environment variables
const ADMIN_EMAIL = process.env.FIREBASE_ADMIN_EMAIL || 'your-email@gmail.com';
const ADMIN_PASSWORD = process.env.FIREBASE_ADMIN_PASSWORD || 'your-password';

async function addSignatureRecipe(): Promise<void> {
  try {
    console.log('🍳 Adding signature recipe to Firestore...');
    
    // Authenticate
    
    if (ADMIN_EMAIL === 'your-email@gmail.com' || ADMIN_PASSWORD === 'your-password') {
      console.error('❌ Please set your admin credentials:');
      console.error('Set environment variables:');
      console.error('  FIREBASE_ADMIN_EMAIL=your-email@gmail.com');
      console.error('  FIREBASE_ADMIN_PASSWORD=your-password');
      console.error('Or update the script with your credentials');
      process.exit(1);
    }
    
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated successfully');
    
    // Create the recipe data directly
    const recipeData: FirestoreRecipe = {
      id: "a3d433b1-8fb4-48e3-a65f-e475a728e98a",
      title: "Tomato Scrambled Eggs",
      description: "A classic Chinese home-style dish featuring fluffy scrambled eggs mixed with juicy tomatoes. This comforting dish balances the richness of eggs with the fresh acidity of tomatoes, creating a perfect harmony of flavors.",
      ingredients: [
        { name: "eggs", amount_from: 3, unit: "pieces", optional: false, tags: ["protein"] },
        { name: "tomatoes", amount_from: 2, unit: "pieces (about 300g)", optional: false, tags: ["vegetable"] },
        { name: "cooking oil", amount_from: 20, unit: "mL", optional: false, tags: ["oil"] },
        { name: "salt", amount_from: 3, unit: "g", optional: false, tags: ["seasoning"] },
        { name: "sugar", amount_from: 2, unit: "g", optional: true, tags: ["seasoning"] },
        { name: "chopped scallions", amount_from: 5, unit: "g", optional: true, tags: ["vegetable", "herb"] }
      ],
      steps: [
        { number: 1, instruction: "Beat the eggs with 1g salt until well combined.", equipment: ["bowl", "whisk or fork"], optional: false },
        { number: 2, instruction: "Wash and cut the tomatoes into chunks (about 2cm pieces).", equipment: ["knife", "cutting board"], optional: false },
        { number: 3, instruction: "Heat oil in a pan over medium-high heat, pour in the beaten eggs, scramble until just set, then remove and set aside.", equipment: ["pan", "spatula"], optional: false },
        { number: 4, instruction: "Keep a little oil in the pan, add chopped scallions (if using), stir-fry briefly for 30 seconds, then add tomato chunks and cook for 2 minutes.", equipment: ["pan", "spatula"], optional: false },
        { number: 5, instruction: "Add remaining 2g salt and sugar, stir until tomatoes start to release their juice and break down slightly.", equipment: ["spatula"], optional: false },
        { number: 6, instruction: "Return the scrambled eggs to the pan, mix evenly with the tomatoes, cook for another 1-2 minutes until the eggs are well coated with tomato sauce, then serve immediately.", equipment: ["spatula", "serving plate"], optional: false }
      ],
      serving: 2,
      total_time: 15,
      nutrition_info: {
        calories: 280,
        protein: 18,
        carbs: 12,
        fat: 18,
        fiber: 3,
        sodium: 800,
        vitamin_c: 15,
        calcium: 80,
        iron: 2
      },
      difficulty: 1,
      imageUrl: "https://i2.chuimg.com/78efc32a192011e7947d0242ac110002_800w_450h.jpg?imageView2/1/w/640/h/520/q/75/format/jpg",
      tags: [
        { category: "country", value: "Chinese" },
        { category: "meal_type", value: "Breakfast" },
        { category: "meal_type", value: "Lunch" },
        { category: "meal_type", value: "Dinner" },
        { category: "style", value: "Home-style" },
        { category: "dietary", value: "Vegetarian" },
        { category: "cooking_method", value: "Stir-fry" }
      ],
      author: "system",
      create_date: new Date(),
      version: 1
    };
    
    console.log('📝 Adding recipe:', recipeData.title);
    
    const docRef = await addDoc(collection(db, "recipes"), recipeData);
    console.log("✅ Recipe added with ID:", docRef.id);
    
    await signOut(auth);
    console.log('🎉 Success! Check your app\'s "Signature" tab to see the recipe.');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message || error);
    
    // Make sure to sign out even on error
    try {
      await signOut(auth);
    } catch (signOutError) {
      // Ignore sign out errors
    }
    
    process.exit(1);
  }
}

// Run the script
addSignatureRecipe().catch(console.error);
