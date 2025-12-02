const fs = require('fs');
const path = require('path');

// Read the generated data file
const dataPath = path.join(__dirname, '..', 'src/lib/demon-wedges-data.ts');
const content = fs.readFileSync(dataPath, 'utf8');

// Extract the allDemonWedges array
const match = content.match(/export const allDemonWedges: DemonWedge\[\] = (\[[\s\S]*?\]);/);
if (!match) {
    console.log('Could not find allDemonWedges array');
    process.exit(1);
}

const arrayStr = match[1];
const allWedges = eval('(' + arrayStr + ')');

console.log(`Total items: ${allWedges.length}`);

// Check for duplicates
const idSet = new Set();
const duplicates = [];

for (const wedge of allWedges) {
    if (idSet.has(wedge.id)) {
        duplicates.push({ id: wedge.id, name: wedge.name });
    }
    idSet.add(wedge.id);
}

console.log(`Unique IDs: ${idSet.size}`);
console.log(`Duplicate IDs found: ${duplicates.length}`);

if (duplicates.length > 0) {
    console.log('\nDuplicates:');
    duplicates.forEach(d => {
        console.log(`  ID: ${d.id} - ${d.name}`);
    });
} else {
    console.log('\n✅ No duplicate IDs found!');
}

// Count by category
const categories = {};
for (const wedge of allWedges) {
    if (!categories[wedge.category]) {
        categories[wedge.category] = 0;
    }
    categories[wedge.category]++;
}

console.log('\nCategory counts:');
for (const [cat, count] of Object.entries(categories)) {
    console.log(`  ${cat}: ${count}`);
}
