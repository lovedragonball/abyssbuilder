const fs = require('fs');

console.log('🔍 Finding items with missing stats\n');

const jsonFiles = [
    { path: 'Info Demon Wedge/Demon Wedge Character.json', name: 'Character' },
    { path: 'Info Demon Wedge/Demon Wedge Melee Weapon.json', name: 'Melee Weapon' },
    { path: 'Info Demon Wedge/Demon Wedge Ranged Weapon.json', name: 'Ranged Weapon' },
    { path: 'Info Demon Wedge/Demon Wedge Melee Consonance Weapon.json', name: 'Melee Consonance' },
    { path: 'Info Demon Wedge/Demon Wedge Ranged Consonance Weapon.json', name: 'Ranged Consonance' },
];

let grandTotal = 0;

for (const file of jsonFiles) {
    console.log(`\n📁 ${file.name}:`);
    const data = JSON.parse(fs.readFileSync(file.path, 'utf8'));
    
    const noStats = data.filter(item => {
        if (typeof item.stats === 'object' && !Array.isArray(item.stats)) {
            const base = item.stats.base || {};
            return Object.keys(base).length === 0;
        }
        return !item.stats || !Array.isArray(item.stats) || item.stats.length === 0;
    });
    
    console.log(`  Total without stats: ${noStats.length}`);
    
    // Show details
    if (noStats.length > 0) {
        console.log(`\n  Examples (first 5):`);
        noStats.slice(0, 5).forEach((item, i) => {
            console.log(`    ${i + 1}. "${item.name}"`);
            console.log(`       ID: ${item.id}`);
            console.log(`       Rarity: ${item.rarity}★`);
            console.log(`       Tolerance: ${item.tolerance}`);
            console.log(`       Stats structure: ${JSON.stringify(item.stats).substring(0, 50)}...`);
        });
        if (noStats.length > 5) {
            console.log(`    ... and ${noStats.length - 5} more`);
        }
    }
    
    grandTotal += noStats.length;
}

console.log('\n' + '─'.repeat(70));
console.log(`\n📊 Total items without stats: ${grandTotal}`);
console.log('\n💡 Interpretation:');
console.log('   Typically, HIGHER RARITY items (4★, 5★) may not have');
console.log('   complete stats data in the JSON. This is often because:');
console.log('   • Stats are dynamically calculated by the game');
console.log('   • Data is still being collected/updated');
console.log('   • Display purpose - actual stats are computed');
console.log('\n   This is NORMAL and EXPECTED in game databases.');
