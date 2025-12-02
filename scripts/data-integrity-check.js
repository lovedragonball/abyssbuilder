const fs = require('fs');

console.log('🔍 Detailed Data Integrity Check\n');

const jsonFiles = [
    { path: 'Info Demon Wedge/Demon Wedge Character.json', name: 'Character' },
    { path: 'Info Demon Wedge/Demon Wedge Melee Weapon.json', name: 'Melee Weapon' },
    { path: 'Info Demon Wedge/Demon Wedge Ranged Weapon.json', name: 'Ranged Weapon' },
    { path: 'Info Demon Wedge/Demon Wedge Melee Consonance Weapon.json', name: 'Melee Consonance' },
    { path: 'Info Demon Wedge/Demon Wedge Ranged Consonance Weapon.json', name: 'Ranged Consonance' },
];

let totalMissingImage = 0;
let totalMissingElement = 0;
let totalMissingPolarity = 0;
let totalInvalidTolerance = 0;
let totalMissingStats = 0;

console.log('Checking each Demon Wedge for required fields:\n');
console.log('Field Requirements:');
console.log('  ✓ image: URL to main image');
console.log('  ✓ tolerance: Number 0-99');
console.log('  ✓ element: Optional but preferred for weapons');
console.log('  ✓ polarity: Optional but preferred for weapons');
console.log('  ✓ stats: Array of {name, value}\n');
console.log('─'.repeat(80) + '\n');

for (const file of jsonFiles) {
    console.log(`📁 ${file.name} (${file.path}):`);
    const data = JSON.parse(fs.readFileSync(file.path, 'utf8'));
    
    let fileMissingImage = 0;
    let fileMissingElement = 0;
    let fileMissingPolarity = 0;
    let fileInvalidTolerance = 0;
    let fileMissingStats = 0;
    let fileGoodItems = 0;
    
    for (const item of data) {
        let isGood = true;
        
        // Check image
        if (!item.images || !item.images.main) {
            fileMissingImage++;
            isGood = false;
        }
        
        // Check tolerance
        if (typeof item.tolerance !== 'number' || item.tolerance < 0 || item.tolerance > 99) {
            fileInvalidTolerance++;
            isGood = false;
        }
        
        // Check element (optional but track)
        if (!item.images || !item.images.element) {
            fileMissingElement++;
        }
        
        // Check polarity (optional but track)
        if (!item.images || !item.images.polarity) {
            fileMissingPolarity++;
        }
        
        // Check stats
        if (!item.stats || (typeof item.stats === 'object' && !item.stats.base && !Array.isArray(item.stats))) {
            fileMissingStats++;
            isGood = false;
        }
        
        if (isGood) fileGoodItems++;
    }
    
    console.log(`  Total: ${data.length}`);
    console.log(`  ✅ Complete items: ${fileGoodItems}`);
    if (fileMissingImage > 0) console.log(`  ⚠️  Missing image: ${fileMissingImage}`);
    if (fileInvalidTolerance > 0) console.log(`  ⚠️  Invalid tolerance: ${fileInvalidTolerance}`);
    if (fileMissingStats > 0) console.log(`  ⚠️  Missing stats: ${fileMissingStats}`);
    console.log(`  📊 Element data: ${data.length - fileMissingElement}/${data.length}`);
    console.log(`  📊 Polarity data: ${data.length - fileMissingPolarity}/${data.length}`);
    
    totalMissingImage += fileMissingImage;
    totalMissingElement += fileMissingElement;
    totalMissingPolarity += fileMissingPolarity;
    totalInvalidTolerance += fileInvalidTolerance;
    totalMissingStats += fileMissingStats;
    
    console.log();
}

console.log('─'.repeat(80));
console.log('\n📊 OVERALL SUMMARY:\n');
console.log(`Total Demon Wedges checked: 493`);
console.log(`\n✅ REQUIRED fields:`);
console.log(`   Images: ${493 - totalMissingImage}/${493} ✓`);
console.log(`   Tolerance: ${493 - totalInvalidTolerance}/${493} ✓`);
console.log(`   Stats: ${493 - totalMissingStats}/${493} ✓`);
console.log(`\n📊 OPTIONAL fields (recommended):`);
console.log(`   Element: ${493 - totalMissingElement}/${493} (${Math.round((493 - totalMissingElement) / 493 * 100)}%)`);
console.log(`   Polarity: ${493 - totalMissingPolarity}/${493} (${Math.round((493 - totalMissingPolarity) / 493 * 100)}%)`);

if (totalMissingImage === 0 && totalInvalidTolerance === 0 && totalMissingStats === 0) {
    console.log('\n✨ ✅ All required fields are present and valid!');
} else {
    console.log('\n❌ Some required fields are missing or invalid');
    console.log(`   Missing images: ${totalMissingImage}`);
    console.log(`   Invalid tolerance: ${totalInvalidTolerance}`);
    console.log(`   Missing stats: ${totalMissingStats}`);
}
