const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateUniqueId(name, category, index) {
    // Create a deterministic UUID based on name + category + index to ensure uniqueness
    const hash = crypto.createHash('sha256').update(name + '::' + category + '::' + index).digest('hex');
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

const jsonFiles = [
    { path: 'Info Demon Wedge/Demon Wedge Character.json', category: 'character' },
    { path: 'Info Demon Wedge/Demon Wedge Melee Weapon.json', category: 'melee-weapon' },
    { path: 'Info Demon Wedge/Demon Wedge Ranged Weapon.json', category: 'ranged-weapon' },
    { path: 'Info Demon Wedge/Demon Wedge Melee Consonance Weapon.json', category: 'melee-consonance' },
    { path: 'Info Demon Wedge/Demon Wedge Ranged Consonance Weapon.json', category: 'ranged-consonance' },
];

let totalItems = 0;
let idChanges = 0;
const idMap = new Map();

console.log('Fixing duplicate IDs in JSON files...\n');

for (const file of jsonFiles) {
    const filePath = path.join(__dirname, '..', file.path);
    console.log(`Processing: ${file.path}`);
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const updatedData = [];
    
    for (const item of data) {
        const newId = generateUniqueId(item.name, file.category, data.indexOf(item));
        
        // Track old -> new ID mapping for debugging
        if (item.id !== newId) {
            idChanges++;
            if (!idMap.has(item.name)) {
                idMap.set(item.name, {});
            }
            idMap.get(item.name)[file.category] = { old: item.id, new: newId };
        }
        
        item.id = newId;
        updatedData.push(item);
        totalItems++;
    }
    
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
    console.log(`  Updated: ${updatedData.length} items`);
}

console.log(`\nTotal items processed: ${totalItems}`);
console.log(`IDs changed: ${idChanges}`);

// Show some examples
console.log('\nSample ID changes:');
let count = 0;
for (const [name, changes] of idMap.entries()) {
    if (count >= 5) break;
    if (Object.keys(changes).length > 0) {
        console.log(`\n${name}:`);
        for (const [cat, ids] of Object.entries(changes)) {
            console.log(`  ${cat}: ${ids.old} -> ${ids.new}`);
        }
        count++;
    }
}

console.log('\nDone! All JSON files have been updated with unique IDs.');
