#!/usr/bin/env node
/**
 * Script to generate demon-wedges-data.ts from JSON files ifunction convertJsonToData(jsonData, category) {
    return jsonData.map((item, index) => {
        const element = extractElement(item.images?.element);
        const polarity = extractPolarity(item.images?.polarity);
        
        // Extract base name - everything before " - " if it exists
        let baseName = item.name;
        if (item.name.includes(' - ')) {
            baseName = item.name.split(' - ')[0].trim();
        }on Wedge folder
 * This ensures all image, element, polarity, and tolerance data matches exactly
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const infoDemonWedgePath = path.join(projectRoot, 'Info Demon Wedge');
const outputPath = path.join(projectRoot, 'src', 'lib', 'demon-wedges-data.ts');

// File mappings
const jsonFiles = {
    character: path.join(infoDemonWedgePath, 'Demon Wedge Character.json'),
    'melee-weapon': path.join(infoDemonWedgePath, 'Demon Wedge Melee Weapon.json'),
    'ranged-weapon': path.join(infoDemonWedgePath, 'Demon Wedge Ranged Weapon.json'),
    'melee-consonance': path.join(infoDemonWedgePath, 'Demon Wedge Melee Consonance Weapon.json'),
    'ranged-consonance': path.join(infoDemonWedgePath, 'Demon Wedge Ranged Consonance Weapon.json'),
};

const ELEMENT_MAP = {
    'pyro': 'Pyro',
    'hydro': 'Hydro',
    'electro': 'Electro',
    'lumino': 'Lumino',
    'anemo': 'Anemo',
    'umbro': 'Umbro',
};

const POLARITY_MAP = {
    '1': 'Circle',
    '2': 'Diamond',
    '3': 'Moon',
    '4': 'Rhombus',
};

function extractElement(elementUrl) {
    if (!elementUrl) return undefined;
    const match = elementUrl.match(/elements\/(\w+)\.webp/i);
    return match ? ELEMENT_MAP[match[1].toLowerCase()] : undefined;
}

function extractPolarity(polarityUrl) {
    if (!polarityUrl) return undefined;
    const match = polarityUrl.match(/polarities\/(\d+)\.webp/i);
    return match ? POLARITY_MAP[match[1]] : undefined;
}

function extractTags(fullName, category) {
    const tags = [];
    
    // Extract base name (before " - " if exists)
    const baseName = fullName.includes(' - ') ? fullName.split(' - ')[0] : fullName;
    
    // Split by whitespace and special characters, but keep proper names together
    const parts = baseName.split(/[\s]+/).filter(p => p.length > 0);
    
    tags.push(...parts);
    
    // Add the suffix part after " - " if exists
    if (fullName.includes(' - ')) {
        const suffix = fullName.split(' - ')[1].trim();
        if (suffix) {
            const suffixParts = suffix.split(/[\s]+/).filter(p => p.length > 0);
            tags.push(...suffixParts);
        }
    }

    // Add category tag
    if (category === 'character') tags.push('Character');
    else if (category === 'melee-weapon') tags.push('Melee');
    else if (category === 'ranged-weapon') tags.push('Ranged');
    else if (category === 'melee-consonance') tags.push('Melee', 'Consonance');
    else if (category === 'ranged-consonance') tags.push('Ranged', 'Consonance');

    return [...new Set(tags)]; // Remove duplicates
}

function determineUsage(category) {
    if (category === 'character') return 'Character';
    if (category.includes('consonance')) return 'Consonance Weapon';
    return 'Weapon';
}

function mapStats(statsObj) {
    return Object.entries(statsObj || {}).map(([name, value]) => ({
        name,
        value: String(value)
    }));
}

function convertJsonToData(jsonData, category) {
    return jsonData.map(item => {
        const element = extractElement(item.images?.element);
        const polarity = extractPolarity(item.images?.polarity);
        const hasRefinementLevels = item.rarity === 5 && item.stats?.refinement_0;
        const baseTolerance = item.tolerance || 0;
        const baseStatsSource = hasRefinementLevels
            ? item.stats.refinement_0
            : item.stats?.base || {};
        const levels = hasRefinementLevels
            ? Array.from({ length: 6 }, (_, index) => ({
                level: index,
                tolerance: baseTolerance + index,
                stats: mapStats(item.stats[`refinement_${index}`] || baseStatsSource),
                description: item.effect || undefined
            }))
            : [{
                level: 0,
                tolerance: baseTolerance,
                stats: mapStats(baseStatsSource)
            }];
        
        // Extract base name - everything before " - " if it exists
        let baseName = item.name;
        if (item.name.includes(' - ')) {
            baseName = item.name.split(' - ')[0].trim();
        }
        
        return {
            id: item.id,
            name: baseName,
            fullName: item.name,
            image: item.images?.main || '',
            elementIcon: element ? `https://dna.interknot-network.com/images/elements/${element.toLowerCase()}.webp` : undefined,
            trackIcon: polarity ? `https://dna.interknot-network.com/images/polarities/${Object.keys(POLARITY_MAP).find(k => POLARITY_MAP[k] === polarity)}.webp` : undefined,
            stats: mapStats(baseStatsSource),
            tolerance: item.tolerance,
            track: polarity ? (Object.keys(POLARITY_MAP).find(k => POLARITY_MAP[k] === polarity) - 1) : 0,
            rarity: item.rarity || 2,
            type: polarity || 'Normal',
            element: element,
            tags: extractTags(item.name, category),
            description: item.effect || undefined,
            category: category,
            usage: determineUsage(category),
            levels
        };
    });
}

function generateTypeScript(allWedges) {
    const typeScriptContent = `// AUTO-GENERATED from Info Demon Wedge JSON files
// This file is generated by sync-demon-wedges-from-json.js
// DO NOT edit manually - regenerate by running: node scripts/sync-demon-wedges-from-json.js

export type DemonWedgeRarity = 2 | 3 | 4 | 5;
export type DemonWedgeType = 'Circle' | 'Diamond' | 'Moon' | 'Rhombus' | 'Normal';
export type DemonWedgeElement = 'Pyro' | 'Hydro' | 'Electro' | 'Lumino' | 'Anemo' | 'Umbro';
export type DemonWedgeCategory = 'character' | 'melee-weapon' | 'ranged-weapon' | 'melee-consonance' | 'ranged-consonance';

export interface DemonWedgeStat { name: string; value: string; }

export interface DemonWedgeLevel {
  level: number;
  tolerance: number;
  stats: DemonWedgeStat[];
  description?: string;
}

export type DemonWedgeUsage = 'Character' | 'Weapon' | 'Consonance Weapon';

export interface DemonWedge {
  id: string;
  name: string;
  fullName: string;
  image: string;
  icon?: string;
  elementIcon?: string;
  trackIcon?: string;
  preview?: string[];
  stats: DemonWedgeStat[];
  tolerance: number;
  track: number;
  rarity: DemonWedgeRarity;
  type: DemonWedgeType;
  element?: DemonWedgeElement;
  tags: string[];
  description?: string;
  canEquipMultiple?: boolean;
  category: DemonWedgeCategory;
  usage: DemonWedgeUsage;
  levels?: DemonWedgeLevel[];
}

export const allDemonWedges: DemonWedge[] = ${JSON.stringify(allWedges, null, 2)};

// ============ FILTER AND UTILITY FUNCTIONS ============

export function getAllTags(wedges: DemonWedge[]): string[] {
  const tagSet = new Set<string>();
  wedges.forEach(w => {
    w.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export function getAllTypes(wedges: DemonWedge[]): DemonWedgeType[] {
  const typeSet = new Set<DemonWedgeType>();
  wedges.forEach(w => typeSet.add(w.type));
  return Array.from(typeSet);
}

export function getAllElements(wedges: DemonWedge[]): DemonWedgeElement[] {
  const elementSet = new Set<DemonWedgeElement>();
  wedges.forEach(w => {
    if (w.element) elementSet.add(w.element);
  });
  return Array.from(elementSet).sort();
}

export interface CategoryStat {
  category: DemonWedgeCategory;
  label: string;
  count: number;
}

const CATEGORY_LABELS: Record<DemonWedgeCategory, string> = {
  'character': 'Character',
  'melee-weapon': 'Melee Weapon',
  'ranged-weapon': 'Ranged Weapon',
  'melee-consonance': 'Melee Consonance Weapon',
  'ranged-consonance': 'Ranged Consonance Weapon',
};

export function getCategoryStats(wedges: DemonWedge[] = allDemonWedges): CategoryStat[] {
  const counts: Record<DemonWedgeCategory, number> = {
    'character': 0,
    'melee-weapon': 0,
    'ranged-weapon': 0,
    'melee-consonance': 0,
    'ranged-consonance': 0,
  };

  wedges.forEach(w => {
    counts[w.category] = (counts[w.category] ?? 0) + 1;
  });

  return (Object.keys(CATEGORY_LABELS) as DemonWedgeCategory[]).map(category => ({
    category,
    label: CATEGORY_LABELS[category],
    count: counts[category] || 0,
  }));
}

export interface FilterOptions {
  search?: string;
  types?: DemonWedgeType[];
  rarities?: DemonWedgeRarity[];
  elements?: DemonWedgeElement[];
  tags?: string[];
  usage?: DemonWedgeUsage[];
  categories?: DemonWedgeCategory[];
}

export function filterDemonWedges(wedges: DemonWedge[], options: FilterOptions): DemonWedge[] {
  return wedges.filter(wedge => {
    // Search filter
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      if (!wedge.fullName.toLowerCase().includes(searchLower) &&
          !wedge.name.toLowerCase().includes(searchLower) &&
          !wedge.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
        return false;
      }
    }

    // Category filter
    if (options.categories && options.categories.length > 0) {
      if (!options.categories.includes(wedge.category)) return false;
    }

    // Type filter
    if (options.types && options.types.length > 0) {
      if (!options.types.includes(wedge.type)) return false;
    }

    // Rarity filter
    if (options.rarities && options.rarities.length > 0) {
      if (!options.rarities.includes(wedge.rarity)) return false;
    }

    // Element filter
    if (options.elements && options.elements.length > 0) {
      if (!wedge.element || !options.elements.includes(wedge.element)) return false;
    }

    // Tag filter
    if (options.tags && options.tags.length > 0) {
      if (!options.tags.some(tag => wedge.tags.includes(tag))) return false;
    }

    // Usage filter
    if (options.usage && options.usage.length > 0) {
      if (!options.usage.includes(wedge.usage)) return false;
    }

    return true;
  });
}

export function getDemonWedgeById(id: string): DemonWedge | undefined {
  return allDemonWedges.find(w => w.id === id);
}

export function getDemonWedgesByName(name: string): DemonWedge[] {
  const lowerName = name.toLowerCase();
  return allDemonWedges.filter(w =>
    w.name.toLowerCase().includes(lowerName) ||
    w.fullName.toLowerCase().includes(lowerName)
  );
}
`;

    return typeScriptContent;
}

async function main() {
    try {
        console.log('🔄 Syncing Demon Wedges from JSON files...');
        
        const allWedges = [];
        
        for (const [category, filePath] of Object.entries(jsonFiles)) {
            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️  File not found: ${filePath}`);
                continue;
            }
            
            const rawData = fs.readFileSync(filePath, 'utf8');
            const jsonData = JSON.parse(rawData);
            const converted = convertJsonToData(jsonData, category);
            
            console.log(`✅ Loaded ${converted.length} items from ${category}`);
            allWedges.push(...converted);
        }
        
        console.log(`📦 Total items: ${allWedges.length}`);
        
        const typeScriptCode = generateTypeScript(allWedges);
        fs.writeFileSync(outputPath, typeScriptCode, 'utf8');
        
        console.log(`✨ Successfully generated: ${outputPath}`);
        console.log(`\n📊 Summary:`);
        console.log(`   - Total Demon Wedges: ${allWedges.length}`);
        console.log(`   - Characters: ${allWedges.filter(w => w.category === 'character').length}`);
        console.log(`   - Melee Weapons: ${allWedges.filter(w => w.category === 'melee-weapon').length}`);
        console.log(`   - Ranged Weapons: ${allWedges.filter(w => w.category === 'ranged-weapon').length}`);
        console.log(`   - Melee Consonance: ${allWedges.filter(w => w.category === 'melee-consonance').length}`);
        console.log(`   - Ranged Consonance: ${allWedges.filter(w => w.category === 'ranged-consonance').length}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
