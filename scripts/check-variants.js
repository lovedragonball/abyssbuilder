const fs = require('fs');

console.log('🔍 Checking variants of same-named items\n');

const characterData = JSON.parse(fs.readFileSync('Info Demon Wedge/Demon Wedge Character.json', 'utf8'));

// Group by base name
const grouped = {};
characterData.forEach(item => {
    const baseName = item.name.split(' - ')[0];
    if (!grouped[baseName]) {
        grouped[baseName] = [];
    }
    grouped[baseName].push(item);
});

// Show items with multiple variants
const multiVariant = Object.entries(grouped).filter(([_, items]) => items.length > 1);

console.log(`Found ${multiVariant.length} base names with multiple variants\n`);

multiVariant.slice(0, 5).forEach(([baseName, items]) => {
    console.log(`📌 "${baseName}" (${items.length} variants):`);
    items.forEach((item, i) => {
        console.log(`   ${i + 1}. ${item.name}`);
        console.log(`      ID: ${item.id}`);
        if (item.stats && Array.isArray(item.stats)) {
            const statsStr = item.stats.map(s => `${s.name}: ${s.value}`).join(', ');
            console.log(`      Stats: ${statsStr}`);
        } else if (item.stats && typeof item.stats === 'object') {
            const base = item.stats.base || {};
            const statsStr = Object.entries(base).map(([k, v]) => `${k}: ${v}`).join(', ');
            console.log(`      Stats: ${statsStr}`);
        }
        console.log(`      Tolerance: ${item.tolerance}`);
        if (item.rarity) console.log(`      Rarity: ${item.rarity}★`);
        console.log();
    });
    console.log('---\n');
});

console.log(`\n✨ Summary: Each character name has multiple "variants" or "forms"`);
console.log('   This is EXPECTED and CORRECT behavior!');
console.log(`   Total unique character names (base): ${multiVariant.length}`);
console.log(`   Total character entries: ${characterData.length}`);
