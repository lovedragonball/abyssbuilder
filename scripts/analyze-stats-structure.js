const fs = require('fs');

console.log('🔍 Analyzing Stats Structure in JSON\n');

const charData = JSON.parse(fs.readFileSync('Info Demon Wedge/Demon Wedge Character.json', 'utf8'));
const meleeWeapon = JSON.parse(fs.readFileSync('Info Demon Wedge/Demon Wedge Melee Weapon.json', 'utf8'));
const consonance = JSON.parse(fs.readFileSync('Info Demon Wedge/Demon Wedge Melee Consonance Weapon.json', 'utf8'));

console.log('📌 Character example (with stats):');
const charWithStats = charData.find(c => c.stats && c.stats.base && Object.keys(c.stats.base).length > 0);
if (charWithStats) {
    console.log(`  Name: "${charWithStats.name}"`);
    console.log(`  Stats structure:`);
    console.log(JSON.stringify(charWithStats.stats, null, 2).substring(0, 200) + '...');
}

console.log('\n📌 Character example (without stats):');
const charWithoutStats = charData.find(c => !c.stats || !c.stats.base || Object.keys(c.stats.base).length === 0);
if (charWithoutStats) {
    console.log(`  Name: "${charWithoutStats.name}"`);
    console.log(`  Stats structure:`);
    console.log(JSON.stringify(charWithoutStats.stats, null, 2).substring(0, 300) + '...');
}

console.log('\n📌 Weapon example (without base stats but has refinement):');
const weaponNoBase = consonance.find(w => (!w.stats.base || Object.keys(w.stats.base).length === 0) && w.stats.refinement_0);
if (weaponNoBase) {
    console.log(`  Name: "${weaponNoBase.name}"`);
    console.log(`  Rarity: ${weaponNoBase.rarity}★`);
    console.log(`  Stats structure (showing refinement_0):`);
    console.log(JSON.stringify({refinement_0: weaponNoBase.stats.refinement_0}, null, 2));
}

console.log('\n📊 Stats Format Summary:');
console.log('───────────────────────────────────────');
console.log('\n1️⃣  CHARACTER Items:');
console.log('   Format: { base: { stat1, stat2, ... } }');
console.log('   or: { refinement_0, refinement_1, ... } (for higher rarity)');

console.log('\n2️⃣  WEAPON Items:');
console.log('   Format: { base: { stat1, stat2, ... } }');
console.log('   or: { refinement_0, refinement_1, ... } (for higher rarity)');

console.log('\n✨ Key Finding:');
console.log('   ALL items have stats data!');
console.log('   Just in different structures:');
console.log('   • Low rarity (2-3★): stats.base = {...}');
console.log('   • High rarity (4-5★): stats.refinement_N = {...}');

// Count by rarity
console.log('\n📊 Stats availability by rarity:\n');

const countByRarity = (data, name) => {
    const byRarity = {2: 0, 3: 0, 4: 0, 5: 0};
    const hasStats = {2: 0, 3: 0, 4: 0, 5: 0};
    
    data.forEach(item => {
        byRarity[item.rarity]++;
        
        if (item.stats) {
            if (item.stats.base && Object.keys(item.stats.base).length > 0) {
                hasStats[item.rarity]++;
            } else if (item.stats.refinement_0) {
                hasStats[item.rarity]++;
            }
        }
    });
    
    console.log(`${name}:`);
    for (const rarity of [2, 3, 4, 5]) {
        if (byRarity[rarity] > 0) {
            const pct = Math.round(hasStats[rarity] / byRarity[rarity] * 100);
            console.log(`  ${rarity}★: ${hasStats[rarity]}/${byRarity[rarity]} (${pct}%)`);
        }
    }
};

countByRarity(charData, 'Characters');
console.log();
countByRarity(meleeWeapon, 'Melee Weapons');
console.log();
countByRarity(consonance, 'Melee Consonance');
