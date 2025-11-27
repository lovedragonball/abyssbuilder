const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'src', 'lib', 'demon-wedges-data.ts');
const raw = fs.readFileSync(dataFilePath, 'utf8');

const arrayMatch = raw.match(/export const allDemonWedges: DemonWedge\[\] = (\[[\s\S]*?\]);/);
if (!arrayMatch) {
  console.error('Could not parse demon wedges data');
  process.exit(1);
}

const entries = eval(arrayMatch[1]);
console.log(`Total entries: ${entries.length}\n`);

// Group by fullName to see variants
const byName = new Map();
entries.forEach(entry => {
  if (!byName.has(entry.fullName)) {
    byName.set(entry.fullName, []);
  }
  byName.get(entry.fullName).push(entry);
});

// Show entries with multiple variants (different element/rarity)
let hasVariants = false;
byName.forEach((variants, fullName) => {
  if (variants.length > 1) {
    hasVariants = true;
    console.log(`"${fullName}" has ${variants.length} variants:`);
    variants.forEach((v, i) => {
      const statsStr = v.stats?.length ? JSON.stringify(v.stats) : 'No stats';
      console.log(`  ${i + 1}. ID: ${v.id}, Element: ${v.element || 'None'}, Rarity: ${v.rarity}★, Tolerance: ${v.tolerance}, Stats: ${statsStr}`);
    });
    console.log('');
  }
});

if (!hasVariants) {
  console.log('No entries with multiple variants found.');
}

// Check for true duplicates (same everything except ID)
const signatures = new Map();
const duplicates = [];
entries.forEach(entry => {
  const statsKey = JSON.stringify((entry.stats || []).sort((a, b) => {
    if (a.name !== b.name) return a.name.localeCompare(b.name);
    return a.value.localeCompare(b.value);
  }));
  const sig = `${entry.fullName}||${statsKey}||${entry.tolerance}||${entry.rarity}||${entry.element || 'None'}||${entry.category}`;
  
  if (signatures.has(sig)) {
    duplicates.push({
      signature: sig,
      first: signatures.get(sig),
      duplicate: entry
    });
  } else {
    signatures.set(sig, entry);
  }
});

if (duplicates.length > 0) {
  console.log(`\n⚠️  Found ${duplicates.length} true duplicates (same fullName + stats + tolerance + rarity + element + category):`);
  duplicates.forEach((dup, i) => {
    console.log(`\n${i + 1}. First: ID ${dup.first.id}, Duplicate: ID ${dup.duplicate.id}`);
    console.log(`   FullName: ${dup.first.fullName}`);
    console.log(`   Stats: ${JSON.stringify(dup.first.stats)}`);
    console.log(`   Tolerance: ${dup.first.tolerance}, Rarity: ${dup.first.rarity}★, Element: ${dup.first.element || 'None'}`);
  });
} else {
  console.log('\n✓ No true duplicates found. All entries are unique.');
}

