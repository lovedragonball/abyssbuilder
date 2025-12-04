const fs = require('fs');

const data = JSON.parse(fs.readFileSync('weapons_refinement_0_to_5.txt', 'utf-8'));

const weaponStats = data.map(weapon => {
    const stats = weapon.refinement_data[0].stats;
    const statKey = Object.keys(stats).find(k => k.match(/Slash ATK|Smash ATK|Spike ATK/));
    return {
        id: weapon.id,
        name: weapon.name,
        primaryStat: statKey ? statKey.replace(' ATK', '') : 'Unknown'
    };
});

// Group by stat type
const grouped = {
    Slash: [],
    Smash: [],
    Spike: [],
    Unknown: []
};

weaponStats.forEach(w => {
    if (grouped[w.primaryStat]) {
        grouped[w.primaryStat].push(w.name);
    }
});

console.log('=== WEAPON PRIMARY STATS ===\n');
Object.entries(grouped).forEach(([stat, weapons]) => {
    if (weapons.length > 0) {
        console.log(`${stat}:`);
        weapons.forEach(w => console.log(`  - ${w}`));
        console.log('');
    }
});

// Save to JSON
const outputData = weaponStats.reduce((acc, w) => {
    acc[w.name] = w.primaryStat;
    return acc;
}, {});

fs.writeFileSync('weapon_primary_stats.json', JSON.stringify(outputData, null, 2), 'utf-8');
console.log('Saved to weapon_primary_stats.json');
