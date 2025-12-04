#!/usr/bin/env node
/**
 * Script to remove Consonance Weapon entries from regular Weapon JSON files
 * Eldritch Cerberus (Melee Consonance) and Eldritch Lilith (Ranged Consonance)
 * should only exist in their respective Consonance Weapon files
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const infoDemonWedgePath = path.join(projectRoot, 'Info Demon Wedge');

const meleeWeaponFile = path.join(infoDemonWedgePath, 'Demon Wedge Melee Weapon.json');
const rangedWeaponFile = path.join(infoDemonWedgePath, 'Demon Wedge Ranged Weapon.json');

function removeConsonanceFromFile(filePath, consonancePrefix) {
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filePath}`);
        return { removed: 0, remaining: 0 };
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(rawData);
    
    const originalCount = jsonData.length;
    
    // Filter out entries that start with the consonance prefix (e.g., "Eldritch Cerberus" or "Eldritch Lilith")
    const filteredData = jsonData.filter(item => {
        const isConsonance = item.name.startsWith(consonancePrefix);
        if (isConsonance) {
            console.log(`  🗑️  Removing: ${item.name} (${item.rarity}★)`);
        }
        return !isConsonance;
    });
    
    const removedCount = originalCount - filteredData.length;
    
    // Write back the filtered data
    fs.writeFileSync(filePath, JSON.stringify(filteredData, null, 2), 'utf8');
    
    return { removed: removedCount, remaining: filteredData.length };
}

async function main() {
    console.log('🔄 Removing Consonance Weapon entries from regular Weapon files...\n');
    
    console.log('📁 Processing Melee Weapon file...');
    const meleeResult = removeConsonanceFromFile(meleeWeaponFile, 'Eldritch Cerberus');
    console.log(`   Removed: ${meleeResult.removed}, Remaining: ${meleeResult.remaining}\n`);
    
    console.log('📁 Processing Ranged Weapon file...');
    const rangedResult = removeConsonanceFromFile(rangedWeaponFile, 'Eldritch Lilith');
    console.log(`   Removed: ${rangedResult.removed}, Remaining: ${rangedResult.remaining}\n`);
    
    console.log('✨ Done! Now run: node scripts/sync-demon-wedges-from-json.js');
}

main();
