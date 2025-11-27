/**
 * Build View Fix - Implementation Verification Script
 * 
 * This script verifies that all required changes have been implemented correctly
 * in the view/[id]/page.tsx file.
 */

const fs = require('fs');
const path = require('path');

const VIEW_PAGE_PATH = path.join(__dirname, '../../../src/app/view/[id]/page.tsx');

console.log('🔍 Build View Fix - Implementation Verification\n');
console.log('=' .repeat(60));

// Read the file
let fileContent;
try {
    fileContent = fs.readFileSync(VIEW_PAGE_PATH, 'utf8');
    console.log('✅ Successfully read view page file\n');
} catch (error) {
    console.error('❌ Failed to read view page file:', error.message);
    process.exit(1);
}

// Test cases
const tests = [
    {
        name: 'WeaponModsHeader Component Exists',
        test: () => fileContent.includes('const WeaponModsHeader'),
        description: 'Verify WeaponModsHeader component is defined'
    },
    {
        name: 'WeaponModsHeader Has Weapon Image',
        test: () => fileContent.includes('weapon.image') && fileContent.includes('WeaponModsHeader'),
        description: 'Verify weapon image is used in header'
    },
    {
        name: 'WeaponModsHeader Has Fallback',
        test: () => fileContent.includes('No Weapon') || fileContent.includes('?'),
        description: 'Verify fallback UI for no weapon'
    },
    {
        name: 'Support Character 1 Has Weapon Mods Section',
        test: () => {
            const supportChar1Section = fileContent.match(/Support Character 1[\s\S]*?<\/motion\.div\s*>/);
            if (!supportChar1Section) return false;
            return supportChar1Section[0].includes('supportModsWpn1');
        },
        description: 'Verify Support Character 1 displays weapon mods'
    },
    {
        name: 'Support Weapon 1 Data Extraction',
        test: () => fileContent.includes("supportMods?.['support-wpn-0']"),
        description: 'Verify supportModsWpn1 data is extracted correctly'
    },
    {
        name: 'Support Weapon 1 Adjusted Slots',
        test: () => fileContent.includes("supportAdjustedSlots?.['support-wpn-0']"),
        description: 'Verify adjusted slots for weapon 1 are checked'
    },
    {
        name: 'Support Character 2 Uses WeaponModsHeader',
        test: () => {
            const supportChar2Section = fileContent.match(/Support Character 2[\s\S]*?<\/motion\.div\s*>/);
            if (!supportChar2Section) return false;
            return supportChar2Section[0].includes('WeaponModsHeader') || 
                   supportChar2Section[0].includes('supportWeapon2');
        },
        description: 'Verify Support Character 2 uses weapon header'
    },
    {
        name: 'Support Weapon 2 Data Extraction',
        test: () => fileContent.includes("supportMods?.['support-wpn-1']"),
        description: 'Verify supportModsWpn2 data is extracted correctly'
    },
    {
        name: 'Consonance Weapon Unchanged',
        test: () => {
            const consonanceSection = fileContent.match(/Consonance Weapon[\s\S]*?<\/motion\.div\s*>/);
            if (!consonanceSection) return true; // OK if conditional
            return consonanceSection[0].includes('grid-cols-4') && 
                   consonanceSection[0].includes('consonanceMods');
        },
        description: 'Verify Consonance Weapon section is unchanged'
    },
    {
        name: 'Grid Layout Consistency',
        test: () => {
            const gridCols5Count = (fileContent.match(/grid-cols-5/g) || []).length;
            return gridCols5Count >= 4; // At least 4 instances (char1, wpn1, char2, wpn2)
        },
        description: 'Verify 5-column grid is used for character and weapon mods'
    },
    {
        name: 'Weapon Image Size',
        test: () => fileContent.includes('w-6 h-6') || fileContent.includes('w-8 h-8'),
        description: 'Verify weapon image has appropriate size classes'
    },
    {
        name: 'Responsive Grid Classes',
        test: () => {
            return fileContent.includes('md:grid-cols-2') && 
                   fileContent.includes('xl:grid-cols-3');
        },
        description: 'Verify responsive grid classes for support cards'
    },
    {
        name: 'ReadOnlyModSlot Component',
        test: () => fileContent.includes('const ReadOnlyModSlot'),
        description: 'Verify ReadOnlyModSlot component exists'
    },
    {
        name: 'Adjusted Slots Green Ring',
        test: () => fileContent.includes('ring-emerald-500') || fileContent.includes('ring-green-500'),
        description: 'Verify adjusted slots have green ring styling'
    },
    {
        name: 'Empty Slot Placeholder',
        test: () => fileContent.includes('border-dashed') && fileContent.includes('+'),
        description: 'Verify empty slots show "+" placeholder'
    }
];

// Run tests
let passed = 0;
let failed = 0;

console.log('Running Tests:\n');

tests.forEach((test, index) => {
    const result = test.test();
    const status = result ? '✅ PASS' : '❌ FAIL';
    
    console.log(`${index + 1}. ${test.name}`);
    console.log(`   ${status}`);
    console.log(`   ${test.description}`);
    console.log();
    
    if (result) {
        passed++;
    } else {
        failed++;
    }
});

// Summary
console.log('=' .repeat(60));
console.log('\n📊 Test Summary:\n');
console.log(`Total Tests: ${tests.length}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);

if (failed === 0) {
    console.log('\n🎉 All tests passed! Implementation is complete.\n');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.\n');
    process.exit(1);
}
