/**
 * Script to check if Firebase environment variables are properly set
 */

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

console.log('🔍 Checking Firebase environment variables...\n');

let allSet = true;

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${envVar}: NOT SET`);
    allSet = false;
  }
}

console.log('\n' + '='.repeat(50));

if (allSet) {
  console.log('🎉 All Firebase environment variables are set!');
  console.log('🚀 You can now run: pnpm add-signature-recipe');
} else {
  console.log('⚠️  Some environment variables are missing.');
  console.log('💡 Please check your .env.local file and make sure all Firebase config values are set.');
  console.log('\nYour .env.local should look like:');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here');
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id');
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com');
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id');
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id');
}
