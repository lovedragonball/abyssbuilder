// Script to generate demon wedges TypeScript data from raw text
// Run this to append to demon-wedges-data.ts

import fs from 'fs';
import path from 'path';

// Helper to create wedge ID from name
function createId(name: string): string {
    return name.toLowerCase()
        .replace(/[']/g, '')
        .replace(/\s+/g, '-')
        .replace(/•/g, '-')
        .replace(/-+/g, '-');
}

// Helper to determine rarity from tolerance
function getRarity(tolerance: number): 2 | 3 | 4 | 5 {
    if (tolerance <= 9) return 3;
    if (tolerance <= 13) return 4;
    return 5;
}

// Helper to extract series/tags from name
function extractTags(fullName: string, category: string): string[] {
    const tags: string[] = [];

    if (fullName.includes('Cerberus')) tags.push('Cerberus');
    if (fullName.includes('Lilith')) tags.push('Lilith');
    if (fullName.includes('Phoenix')) tags.push('Phoenix');
    if (fullName.includes('Typhon')) tags.push('Typhon');
    if (fullName.includes('Eldritch')) tags.push('Eldritch');
    if (fullName.includes('Feathered Serpent')) tags.push('Feathered Serpent');
    if (fullName.includes('Griffin')) tags.push('Griffin');
    if (fullName.includes('Pan')) tags.push('Pan');
    if (fullName.includes('Siren')) tags.push('Siren');
    if (fullName.includes('Covenanter')) tags.push('Covenanter');
    if (fullName.includes('Jormungand')) tags.push('Jormungand');
    if (fullName.includes('Fenrir')) tags.push('Fenrir');
    if (fullName.includes('Fafnir')) tags.push('Fafnir');
    if (fullName.includes('Sphinx')) tags.push('Sphinx');
    if (fullName.includes('Arbiter')) tags.push('Arbiter');
    if (fullName.includes('Bahamut')) tags.push('Bahamut');
    if (fullName.includes('Ifrit')) tags.push('Ifrit');
    if (fullName.includes('Summanus')) tags.push('Summanus');
    if (fullName.includes('Helios')) tags.push('Helios');
    if (fullName.includes('Hastur')) tags.push('Hastur');

    // Add category
    if (category === 'character') tags.push('Character');
    if (category === 'melee-weapon') tags.push('Melee Weapon');
    if (category === 'ranged-weapon') tags.push('Ranged Weapon');
    if (category === 'melee-consonance') tags.push('Melee Consonance');
    if (category === 'ranged-consonance') tags.push('Ranged Consonance');

    return tags;
}

// Sample generation
const sampleWedges = `
// Note: To fully complete this file, add the remaining wedge data here
// Following the pattern below for each series
`;

console.log('Generated sample wedge code');
console.log('Add remaining wedges following the existing pattern in demon-wedges-data.ts');
