const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'src', 'lib', 'demon-wedges-data.ts');
const raw = fs.readFileSync(dataFilePath, 'utf8');

// Extract all entries
const entryRegex = /\{\s*"id":\s*"([^"]+)",[\s\S]*?"fullName":\s*"([^"]+)",[\s\S]*?\}/g;
const entries = [];
let match;

// More comprehensive extraction
const arrayMatch = raw.match(/export const allDemonWedges: DemonWedge\[\] = (\[[\s\S]*?\]);/);
if (arrayMatch) {
  try {
    const entriesArray = eval(arrayMatch[1]);
    entries.push(...entriesArray);
  } catch (e) {
    console.error('Error parsing array:', e.message);
  }
}

console.log(`Total entries found: ${entries.length}`);

// Check for duplicate IDs
const idMap = new Map();
entries.forEach((entry, index) => {
  if (!entry.id) return;
  if (idMap.has(entry.id)) {
    console.log(`\n⚠️  Duplicate ID found: ${entry.id}`);
    console.log(`   First occurrence: ${idMap.get(entry.id)}`);
    console.log(`   Second occurrence: index ${index}`);
  } else {
    idMap.set(entry.id, `index ${index}`);
  }
});

// Check for duplicate fullNames with same stats
const fullNameMap = new Map();
entries.forEach((entry, index) => {
  if (!entry.fullName) return;
  const key = entry.fullName;
  const statsKey = JSON.stringify(entry.stats || []);
  const tolerance = entry.tolerance;
  const rarity = entry.rarity;
  const element = entry.element || 'None';
  const category = entry.category || 'unknown';
  
  // Create a unique signature
  const signature = `${key}||${statsKey}||${tolerance}||${rarity}||${element}||${category}`;
  
  if (fullNameMap.has(signature)) {
    const existing = fullNameMap.get(signature);
    console.log(`\n⚠️  Duplicate entry found:`);
    console.log(`   FullName: ${key}`);
    console.log(`   Stats: ${statsKey}`);
    console.log(`   Tolerance: ${tolerance}, Rarity: ${rarity}, Element: ${element}, Category: ${category}`);
    console.log(`   First ID: ${existing.id} (index ${existing.index})`);
    console.log(`   Duplicate ID: ${entry.id} (index ${index})`);
  } else {
    fullNameMap.set(signature, { id: entry.id, index });
  }
});

// Check for same fullName but different stats (these should be separate entries)
const nameGroups = new Map();
entries.forEach((entry, index) => {
  if (!entry.fullName) return;
  const key = entry.fullName;
  if (!nameGroups.has(key)) {
    nameGroups.set(key, []);
  }
  nameGroups.get(key).push({
    id: entry.id,
    index,
    stats: entry.stats || [],
    tolerance: entry.tolerance,
    rarity: entry.rarity,
    element: entry.element,
    category: entry.category,
  });
});

// Report entries with same name but different stats
let hasVariants = false;
nameGroups.forEach((variants, fullName) => {
  if (variants.length > 1) {
    // Check if they're actually different
    const uniqueVariants = new Set();
    variants.forEach(v => {
      const sig = JSON.stringify({
        stats: v.stats,
        tolerance: v.tolerance,
        rarity: v.rarity,
        element: v.element,
        category: v.category,
      });
      uniqueVariants.add(sig);
    });
    
    if (uniqueVariants.size > 1) {
      hasVariants = true;
      console.log(`\n✓ Valid variants found for "${fullName}":`);
      variants.forEach((v, i) => {
        console.log(`   Variant ${i + 1}: ID ${v.id}, Rarity ${v.rarity}, Tolerance ${v.tolerance}, Stats: ${JSON.stringify(v.stats)}`);
      });
    } else if (variants.length > 1) {
      console.log(`\n⚠️  Same fullName with identical stats (potential duplicates): "${fullName}"`);
      variants.forEach((v, i) => {
        console.log(`   Entry ${i + 1}: ID ${v.id}, Index ${v.index}`);
      });
    }
  }
});

if (!hasVariants && idMap.size === entries.length) {
  console.log('\n✓ No duplicate entries found. All entries are unique.');
}

