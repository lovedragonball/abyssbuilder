const fs = require('fs');
const path = require('path');

// Parse dataset
const datasetPath = path.join(__dirname, '..', 'Wedge_Data_Dynamic_Tolerance_2025_Tolerance_update.txt');
const datasetRaw = fs.readFileSync(datasetPath, 'utf8');

// Parse generated file
const dataFilePath = path.join(__dirname, '..', 'src', 'lib', 'demon-wedges-data.ts');
const generatedRaw = fs.readFileSync(dataFilePath, 'utf8');
const arrayMatch = generatedRaw.match(/export const allDemonWedges: DemonWedge\[\] = (\[[\s\S]*?\]);/);
if (!arrayMatch) {
  console.error('Could not parse generated file');
  process.exit(1);
}
const generatedEntries = eval(arrayMatch[1]);

// Parse all cards from dataset
const cardRegex = /=== CARD #(\d+) START ===([\s\S]*?)=== CARD #\d+ END ===/g;
const datasetCards = [];
let match;

while ((match = cardRegex.exec(datasetRaw)) !== null) {
  const cardNum = match[1];
  const block = match[2];
  
  const nameLine = block.match(/Name:\s*(.+)/);
  if (!nameLine) continue;
  const fullName = nameLine[1].trim();
  
  const rarityMatch = block.match(/Rarity:\s*(\d+)/);
  const rarity = rarityMatch ? Number(rarityMatch[1]) : undefined;
  
  const elementLine = block.match(/Element:\s*(.+)/);
  const elementRaw = elementLine ? elementLine[1].trim().toLowerCase() : undefined;
  const ELEMENT_MAP = {
    'pyro': 'Pyro',
    'hydro': 'Hydro',
    'electro': 'Electro',
    'lumino': 'Lumino',
    'anemo': 'Anemo',
    'umbro': 'Umbro',
    'none': undefined
  };
  const element = ELEMENT_MAP[elementRaw] ?? undefined;
  
  // Parse stats from base level (same method as build script)
  const dataPart = block.split('[Game Data]')[1];
  const stats = [];
  if (dataPart) {
    const levelRegex = /--- (Base Level|Level \+(\d+)) ---([\s\S]*?)(?=(---|=== CARD|$))/g;
    const baseLevelMatch = levelRegex.exec(dataPart);
    if (baseLevelMatch && baseLevelMatch[1] === 'Base Level') {
      const body = baseLevelMatch[3];
      body
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .forEach(line => {
          const cleaned = line.replace(/^-+\s*/, '');
          const colonIdx = cleaned.indexOf(':');
          if (colonIdx === -1) return;
          const key = cleaned.slice(0, colonIdx).trim();
          const value = cleaned.slice(colonIdx + 1).trim();
          if (!value) return;
          if (!/^Tolerance/i.test(key) && !/^Effect/i.test(key)) {
            stats.push({ name: key, value });
          }
        });
    }
  }
  
  // Create signature
  const statsKey = JSON.stringify(stats.sort((a, b) => {
    if (a.name !== b.name) return a.name.localeCompare(b.name);
    return a.value.localeCompare(b.value);
  }));
  
  datasetCards.push({
    cardNum: Number(cardNum),
    fullName,
    rarity,
    element: element || 'None',
    stats,
    signature: `${fullName}||${statsKey}||${rarity}||${element || 'None'}`
  });
}

console.log(`Dataset cards: ${datasetCards.length}`);
console.log(`Generated entries: ${generatedEntries.length}\n`);

// Create signature map for generated entries
const generatedSignatures = new Map();
generatedEntries.forEach(entry => {
  const statsKey = JSON.stringify((entry.stats || []).sort((a, b) => {
    if (a.name !== b.name) return a.name.localeCompare(b.name);
    return a.value.localeCompare(b.value);
  }));
  const sig = `${entry.fullName}||${statsKey}||${entry.rarity}||${entry.element || 'None'}`;
  generatedSignatures.set(sig, entry);
});

// Find missing cards
const missingCards = [];
datasetCards.forEach(card => {
  if (!generatedSignatures.has(card.signature)) {
    missingCards.push(card);
  }
});

if (missingCards.length > 0) {
  console.log(`⚠️  Found ${missingCards.length} missing card(s):\n`);
  missingCards.forEach(card => {
    console.log(`Card #${card.cardNum}: "${card.fullName}"`);
    console.log(`  Rarity: ${card.rarity}★, Element: ${card.element}`);
    console.log(`  Stats: ${JSON.stringify(card.stats)}`);
    console.log(`  Signature: ${card.signature}`);
    console.log('');
  });
} else {
  console.log('✓ All cards from dataset are present in generated file.');
}

// Also check for duplicates in dataset
const datasetSignatures = new Map();
const duplicatesInDataset = [];
datasetCards.forEach(card => {
  if (datasetSignatures.has(card.signature)) {
    duplicatesInDataset.push({
      signature: card.signature,
      first: datasetSignatures.get(card.signature),
      duplicate: card
    });
  } else {
    datasetSignatures.set(card.signature, card);
  }
});

if (duplicatesInDataset.length > 0) {
  console.log(`\n⚠️  Found ${duplicatesInDataset.length} duplicate signature(s) in dataset:`);
  duplicatesInDataset.forEach((dup, i) => {
    console.log(`\n${i + 1}. Signature: ${dup.signature}`);
    console.log(`   First: Card #${dup.first.cardNum}`);
    console.log(`   Duplicate: Card #${dup.duplicate.cardNum}`);
  });
}

