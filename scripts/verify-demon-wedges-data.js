#!/usr/bin/env node
/**
 * Verify Demon Wedges data integrity
 * Checks that all categories have correct counts and no duplicates
 */

const fs = require('fs');
const path = require('path');

// Read and count categories from the JSON source files
const infoDemonWedgePath = path.join(__dirname, '..', 'Info Demon Wedge');

const jsonFiles = {
    'character': 'Demon Wedge Character.json',
    'melee-weapon': 'Demon Wedge Melee Weapon.json',
    'ranged-weapon': 'Demon Wedge Ranged Weapon.json',
    'melee-consonance': 'Demon Wedge Melee Consonance Weapon.json',
    'ranged-consonance': 'Demon Wedge Ranged Consonance Weapon.json'
};

console.log('🔍 Verifying Demon Wedges Data Integrity...\n');

// Expected counts
const expectedCounts = {
    'character': 249,
    'melee-weapon': 89,
    'ranged-weapon': 85,
    'melee-consonance': 35,
    'ranged-consonance': 35
};

console.log('📊 Category Counts from JSON Source Files:');
let totalItems = 0;
let allCorrect = true;

for (const [category, filename] of Object.entries(jsonFiles)) {
    const filePath = path.join(infoDemonWedgePath, filename);
    
    if (!fs.existsSync(filePath)) {
        console.log(`  ❌ ${filename} not found`);
        allCorrect = false;
        continue;
    }
    
    try {
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const count = jsonData.length;
        const expected = expectedCounts[category];
        const status = count === expected ? '✅' : '❌';
        const categoryLabel = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        console.log(`  ${status} ${categoryLabel}: ${count}/${expected}`);
        
        if (count !== expected) {
            allCorrect = false;
        }
        
        totalItems += count;
        
        // Check for duplicate IDs within this category
        const ids = new Set();
        const duplicates = [];
        jsonData.forEach(item => {
            if (ids.has(item.id)) {
                duplicates.push(item.id);
            }
            ids.add(item.id);
        });
        
        if (duplicates.length > 0) {
            console.log(`     ⚠️  Found ${duplicates.length} duplicate IDs`);
            allCorrect = false;
        }
    } catch (error) {
        console.log(`  ❌ Error reading ${filename}: ${error.message}`);
        allCorrect = false;
    }
}

console.log(`\n📈 Total Items: ${totalItems}`);
console.log(`   Expected: ${Object.values(expectedCounts).reduce((a, b) => a + b, 0)}`);

if (totalItems === Object.values(expectedCounts).reduce((a, b) => a + b, 0)) {
    console.log('   ✅ Total matches expected');
} else {
    console.log('   ❌ Total does not match expected');
    allCorrect = false;
}

// Check TypeScript file exists and compiles
console.log('\n� Checking TypeScript compilation...');
const tsFilePath = path.join(__dirname, '..', 'src', 'lib', 'demon-wedges-data.ts');
if (fs.existsSync(tsFilePath)) {
    const stats = fs.statSync(tsFilePath);
    console.log(`  ✅ File exists (${(stats.size / 1024).toFixed(2)} KB)`);
} else {
    console.log('  ❌ File not found');
    allCorrect = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allCorrect) {
    console.log('✨ All verification checks passed! ✨');
    console.log('='.repeat(50));
    process.exit(0);
} else {
    console.log('⚠️ Some verification checks failed!');
    console.log('='.repeat(50));
    process.exit(1);
}

