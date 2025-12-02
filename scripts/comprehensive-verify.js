const fs = require('fs');
const path = require('path');

console.log('🔍 Comprehensive Demon Wedges Data Verification\n');

// Read all JSON files
const jsonFiles = [
    { path: 'Info Demon Wedge/Demon Wedge Character.json', category: 'character', expectedCount: 249 },
    { path: 'Info Demon Wedge/Demon Wedge Melee Weapon.json', category: 'melee-weapon', expectedCount: 89 },
    { path: 'Info Demon Wedge/Demon Wedge Ranged Weapon.json', category: 'ranged-weapon', expectedCount: 85 },
    { path: 'Info Demon Wedge/Demon Wedge Melee Consonance Weapon.json', category: 'melee-consonance', expectedCount: 35 },
    { path: 'Info Demon Wedge/Demon Wedge Ranged Consonance Weapon.json', category: 'ranged-consonance', expectedCount: 35 },
];

let totalItems = 0;
let totalUniqueNames = 0;
const allIds = {};
const allNames = {};
const categoryData = {};

console.log('📋 Reading JSON files...\n');

for (const file of jsonFiles) {
    try {
        const data = JSON.parse(fs.readFileSync(file.path, 'utf8'));
        console.log(`${file.path}:`);
        console.log(`  Count: ${data.length} items (expected: ${file.expectedCount})`);
        
        if (data.length !== file.expectedCount) {
            console.log(`  ⚠️  COUNT MISMATCH!`);
        }
        
        // Check for duplicates within this file
        const localIds = new Set();
        const localNames = new Set();
        let localDupes = 0;
        
        for (const item of data) {
            if (localIds.has(item.id)) {
                localDupes++;
            }
            localIds.add(item.id);
            localNames.add(item.name);
            
            // Track global IDs
            if (!allIds[item.id]) {
                allIds[item.id] = [];
            }
            allIds[item.id].push({ file: file.path.split('/')[1], name: item.name, category: file.category });
            
            // Track global names
            if (!allNames[item.name]) {
                allNames[item.name] = [];
            }
            allNames[item.name].push({ file: file.path.split('/')[1], category: file.category });
        }
        
        console.log(`  Unique IDs in file: ${localIds.size}`);
        console.log(`  Unique names in file: ${localNames.size}`);
        if (localDupes > 0) console.log(`  ⚠️  Duplicate IDs within file: ${localDupes}`);
        
        categoryData[file.category] = {
            count: data.length,
            uniqueIds: localIds.size,
            uniqueNames: localNames.size,
        };
        
        totalItems += data.length;
        totalUniqueNames += localNames.size;
        console.log();
    } catch (err) {
        console.log(`❌ Error reading ${file.path}: ${err.message}`);
    }
}

console.log('━'.repeat(60));
console.log('\n📊 SUMMARY:\n');
console.log(`Total items across all files: ${totalItems}`);
console.log(`Total unique IDs: ${Object.keys(allIds).length}`);
console.log(`Total unique names: ${Object.keys(allNames).length}`);

// Find cross-file duplicates
const crossFileDupes = Object.entries(allIds).filter(([_, items]) => items.length > 1);
console.log(`\nCross-file ID duplicates: ${crossFileDupes.length}`);

if (crossFileDupes.length > 0) {
    console.log('\n⚠️  Cross-file duplicates found:');
    crossFileDupes.slice(0, 5).forEach(([id, items]) => {
        console.log(`\n  ID: ${id}`);
        items.forEach(item => {
            console.log(`    - ${item.file} (${item.category}): ${item.name}`);
        });
    });
    if (crossFileDupes.length > 5) {
        console.log(`\n  ... and ${crossFileDupes.length - 5} more`);
    }
}

// Find items with same name in different categories
const sameName = Object.entries(allNames).filter(([_, items]) => items.length > 1);
console.log(`\nItems with same name in different categories: ${sameName.length}`);

if (sameName.length > 0) {
    console.log('\nExamples:');
    sameName.slice(0, 5).forEach(([name, items]) => {
        console.log(`\n  "${name}"`);
        items.forEach(item => {
            console.log(`    - ${item.file} (${item.category})`);
        });
    });
}

console.log('\n━'.repeat(60));
console.log('\n💡 INTERPRETATION:\n');

if (Object.keys(allIds).length === totalItems) {
    console.log('✅ All IDs are unique - each item has a different ID');
    console.log('✅ This means you have ' + totalItems + ' distinct Demon Wedges');
} else {
    const actualUnique = Object.keys(allIds).length;
    const duplicates = totalItems - actualUnique;
    console.log(`❌ Found ${duplicates} duplicate IDs`);
    console.log(`   Total items: ${totalItems}`);
    console.log(`   Unique items: ${actualUnique}`);
    console.log(`   This suggests some Demon Wedges are listed multiple times across files`);
}

console.log('\n✨ Detailed category breakdown:');
for (const [cat, data] of Object.entries(categoryData)) {
    console.log(`  ${cat}: ${data.count} items, ${data.uniqueIds} unique IDs, ${data.uniqueNames} unique names`);
}
