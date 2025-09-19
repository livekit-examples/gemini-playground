#!/usr/bin/env node

/**
 * Script to deploy Firestore security rules
 * Run with: node scripts/deploy-firestore-rules.js
 * 
 * Prerequisites:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login to Firebase: firebase login
 * 3. Initialize Firebase in your project: firebase init
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Deploying Firestore Security Rules...');

try {
  // Check if firebase.json exists
  const firebaseConfigPath = path.join(__dirname, '..', 'firebase.json');
  if (!fs.existsSync(firebaseConfigPath)) {
    console.log('📝 Creating firebase.json configuration...');
    
    const firebaseConfig = {
      "firestore": {
        "rules": "firestore.rules"
      }
    };
    
    fs.writeFileSync(firebaseConfigPath, JSON.stringify(firebaseConfig, null, 2));
    console.log('✅ Created firebase.json');
  }
  
  // Check if firestore.rules exists
  const rulesPath = path.join(__dirname, '..', 'firestore.rules');
  if (!fs.existsSync(rulesPath)) {
    console.error('❌ firestore.rules file not found!');
    console.error('Please ensure firestore.rules exists in the web directory.');
    process.exit(1);
  }
  
  console.log('📋 Current Firestore rules:');
  const rules = fs.readFileSync(rulesPath, 'utf8');
  console.log(rules);
  
  console.log('🚀 Deploying rules to Firebase...');
  
  // Deploy only Firestore rules
  execSync('firebase deploy --only firestore:rules', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('✅ Firestore rules deployed successfully!');
  console.log('');
  console.log('🔒 Security Rules Summary:');
  console.log('- recipes: Read access for all, write access for authenticated users');
  console.log('- Recipe_History: Full CRUD access for users on their own records only');
  console.log('- All other collections: Access denied');
  
} catch (error) {
  console.error('❌ Error deploying Firestore rules:', error.message);
  console.error('');
  console.error('🛠️  Troubleshooting:');
  console.error('1. Make sure Firebase CLI is installed: npm install -g firebase-tools');
  console.error('2. Login to Firebase: firebase login');
  console.error('3. Initialize Firebase project: firebase init');
  console.error('4. Make sure you have the correct Firebase project selected');
  
  process.exit(1);
}
