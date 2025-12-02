#!/usr/bin/env node
/**
 * Deep verification of Demon Wedges data - check for actual duplicates in array
 */

const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'src', 'lib', 'demon-wedges-data.ts');

// Read file
const content = fs.readFileSync(dataFilePath, 'utf8');

// Find the array content more carefully
const arrayStart = content.indexOf('export const allDemonWedges: DemonWedge[] = [');
const arrayEnd = content.lastIndexOf('];');

if (arrayStart === -1 || arrayEnd === -1) {
    console.error('❌ Could not find allDemonWedges array');
    process.exit(1);
}

const arrayContent = content.substring(arrayStart + 'export const allDemonWedges: DemonWedge[] = '.length, arrayEnd + 1);

// Use JSON parse to be accurate
try {
    const allWedges = JSON.parse(arrayContent);
    
    console.log('🔍 Deep Verification of Demon Wedges Data\n');
    
    // Check for duplicate IDs
    const ids = new Map();
    const duplicates = [];
    
    allWedges.forEach((wedge, index) => {
        if (ids.has(wedge.id)) {
            duplicates.push({
                id: wedge.id,
                first: ids.get(wedge.id),
                duplicate: index,
                name: wedge.fullName
            });
        }
        ids.set(wedge.id, index);
    });
    
    console.log(`📊 Total items in array: ${allWedges.length}`);
    console.log(`   Unique IDs: ${ids.size}`);
    
    if (duplicates.length === 0) {
        console.log(`✅ No duplicate IDs found\n`);
    } else {
        console.log(`❌ Found ${duplicates.length} duplicate IDs:\n`);
        duplicates.slice(0, 10).forEach(dup => {
            console.log(`   ID: ${dup.id}`);
            console.log(`   Name: ${dup.name}`);
            console.log(`   Indices: ${dup.first} and ${dup.duplicate}\n`);
        });
        if (duplicates.length > 10) {
            console.log(`   ... and ${duplicates.length - 10} more\n`);
        }
    }
    
    // Count by category
    console.log('📈 Items by category:');
    const categoryCounts = {};
    allWedges.forEach(w => {
        categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([cat, count]) => {
        const label = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        console.log(`   ${label}: ${count}`);
    });
    
    console.log('\n' + '='.repeat(50));
    if (duplicates.length === 0 && allWedges.length === 493) {
        console.log('✨ All checks passed! ✨');
        process.exit(0);
    } else {
        console.log('⚠️ Issues found!');
        process.exit(1);
    }
    
} catch (error) {
    console.error('❌ Error parsing array:', error.message);
    process.exit(1);
}
