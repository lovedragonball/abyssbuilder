const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../src/lib/demon-wedges-data.ts');
const NEW_DATA_FILE = path.join(__dirname, '../Wedge_Data_Dynamic_Tolerance_2025_Tolerance_update.txt');

const ELEMENT_MAP = {
    pyro: 'Pyro',
    hydro: 'Hydro',
    electro: 'Electro',
    lumino: 'Lumino',
    anemo: 'Anemo',
    umbro: 'Umbro',
};

function normalizeElement(raw) {
    if (!raw || raw.toLowerCase() === 'none') return undefined;
    const key = raw.trim().toLowerCase();
    return ELEMENT_MAP[key] || undefined;
}

function inferCategoryFromName(name) {
    const lower = name.toLowerCase();
    // Cerberus (including Eldritch) = Melee Consonance
    if (lower.includes('cerberus')) return 'melee-consonance';
    // Lilith (including Eldritch) = Ranged Consonance
    if (lower.includes('lilith')) return 'ranged-consonance';
    if (lower.includes('fenrir')) return 'melee-weapon';
    if (lower.includes('fafnir')) return 'ranged-weapon';
    if (lower.includes('jormungand')) return 'character';
    return 'character';
}

function parseCardBlocks(rawText) {
    const cards = [];
    const cardRegex = /=== CARD #(\d+) START ===\s*([\s\S]*?)\s*=== CARD #\1 END ===/g;
    let match;

    while ((match = cardRegex.exec(rawText)) !== null) {
        const cardNumber = match[1];
        const cardContent = match[2];
        const card = parseCard(cardContent, cardNumber);
        if (card) {
            cards.push(card);
        }
    }

    return cards;
}

function parseCard(content, cardNumber) {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const card = {
        cardNumber: parseInt(cardNumber, 10),
        stats: [],
        levels: [],
    };

    let section = null;
    let currentLevel = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Section headers
        if (line === '[Identity]') {
            section = 'identity';
            continue;
        } else if (line === '[Visual Assets]') {
            section = 'visual';
            continue;
        } else if (line === '[Game Data]') {
            section = 'gamedata';
            continue;
        }

        // Level markers
        if (line.startsWith('--- ') && line.endsWith(' ---')) {
            const levelText = line.replace(/^--- /, '').replace(/ ---$/, '');
            currentLevel = { levelName: levelText, stats: [], effects: [] };
            card.levels.push(currentLevel);
            continue;
        }

        // Parse based on section
        if (section === 'identity') {
            if (line.startsWith('Name:')) {
                card.name = line.replace('Name:', '').trim();
            } else if (line.startsWith('Rarity:')) {
                card.rarity = parseInt(line.replace('Rarity:', '').trim(), 10);
            } else if (line.startsWith('Element:')) {
                card.element = normalizeElement(line.replace('Element:', '').trim());
            }
        } else if (section === 'visual') {
            if (line.match(/^\d+\.\s*Main Image:/)) {
                const url = line.replace(/^\d+\.\s*Main Image:/, '').trim();
                if (url && url.toLowerCase() !== 'none') {
                    card.mainImage = url;
                }
            } else if (line.match(/^\d+\.\s*Element Icon:/)) {
                const url = line.replace(/^\d+\.\s*Element Icon:/, '').trim();
                if (url && url.toLowerCase() !== 'none') {
                    card.elementIcon = url;
                }
            } else if (line.match(/^\d+\.\s*Track Icon:/)) {
                const url = line.replace(/^\d+\.\s*Track Icon:/, '').trim();
                if (url && url.toLowerCase() !== 'none') {
                    card.trackIcon = url;
                }
            }
        } else if (section === 'gamedata' && currentLevel) {
            if (line.startsWith('- ')) {
                const statLine = line.replace(/^-\s*/, '');

                if (statLine.startsWith('Tolerance:')) {
                    const value = statLine.replace('Tolerance:', '').trim();
                    currentLevel.tolerance = parseFloat(value) || 0;
                } else if (statLine.startsWith('Effect:')) {
                    const effect = statLine.replace('Effect:', '').trim();
                    currentLevel.effects.push(effect);
                } else {
                    // Regular stat line
                    const colonIndex = statLine.indexOf(':');
                    if (colonIndex > 0) {
                        const name = statLine.substring(0, colonIndex).trim();
                        const value = statLine.substring(colonIndex + 1).trim();
                        currentLevel.stats.push({ name, value });
                    }
                }
            }
        }
    }

    return card;
}

function buildPreviewArray(cards, baseName) {
    // Find all variants of this base name with different elements
    const variants = cards.filter(c => {
        const cBaseName = c.name.split(' - ')[0];
        return cBaseName === baseName && c.element;
    });

    if (variants.length < 2) return undefined;

    // Build preview array from main images
    const previews = [];
    const elementOrder = ['lumino', 'anemo', 'electro', 'pyro', 'hydro', 'umbro'];

    elementOrder.forEach(elem => {
        const variant = variants.find(v => v.element && v.element.toLowerCase() === elem);
        if (variant && variant.mainImage) {
            previews.push(variant.mainImage);
        }
    });

    return previews.length >= 2 ? previews : undefined;
}

function processCards(cards) {
    const processedWedges = [];
    const baseNameMap = new Map();

    // First pass: group by base name to detect multi-element wedges
    cards.forEach(card => {
        const baseName = card.name.split(' - ')[0];
        if (!baseNameMap.has(baseName)) {
            baseNameMap.set(baseName, []);
        }
        baseNameMap.get(baseName).push(card);
    });

    // Detect which base names have multiple element variants
    const multiElementBases = new Set();
    baseNameMap.forEach((variants, baseName) => {
        const elementVariants = variants.filter(v => v.element);
        if (elementVariants.length >= 2) {
            multiElementBases.add(baseName);
        }
    });

    // Second pass: process each card
    cards.forEach((card, index) => {
        const id = `dw-${index + 1}`;
        const baseName = card.name.split(' - ')[0];
        const variant = card.name.includes(' - ') ? card.name.split(' - ')[1] : undefined;

        // Get base level data (first level, usually "Base Level" or "Level +0")
        const baseLevel = card.levels[0] || { stats: [], tolerance: 0, effects: [] };

        // Build stats array
        const stats = baseLevel.stats || [];

        // Build description from effects
        const description = baseLevel.effects.length > 0
            ? baseLevel.effects.join(' ').replace(/"/g, '\\"')
            : undefined;

        // Check canEquipMultiple
        const canEquipMultiple = description && description.includes('Once upgraded to +5');

        // Get category
        const category = inferCategoryFromName(card.name);

        // Build preview array for multi-element wedges
        let preview;
        if (multiElementBases.has(baseName)) {
            preview = buildPreviewArray(cards, baseName);
        }

        // Covenanter special handling
        if (baseName.toLowerCase().includes('covenanter')) {
            preview = [
                'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_lumino.png',
                'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_anemo.png',
                'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_electro_v1.png',
                'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_pyro_v1.png',
                'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_hydro_v1.png',
                'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_umbro_v1.png',
            ];
        }

        // Build tags
        const tags = new Set();
        if (variant) tags.add(variant);
        if (baseName.includes('Prime')) tags.add('Prime');
        if (baseName.includes('Eldritch')) tags.add('Eldritch');
        if (baseName.includes('Feathered Serpent')) tags.add('Feathered Serpent');

        // Determine type based on track icon or other criteria
        let type = 'Normal';
        if (card.trackIcon) {
            if (card.trackIcon.includes('/1.webp')) type = 'Circle';
            else if (card.trackIcon.includes('/2.webp')) type = 'Diamond';
            else if (card.trackIcon.includes('/3.webp')) type = 'Moon';
            else if (card.trackIcon.includes('/4.webp')) type = 'Rhombus';
        }

        // Process levels
        const levels = card.levels.map(l => {
            let levelNum = 0;
            const match = l.levelName.match(/Level \+(\d+)/);
            if (match) {
                levelNum = parseInt(match[1], 10);
            }

            return {
                level: levelNum,
                tolerance: l.tolerance || 0,
                stats: l.stats || [],
                description: l.effects.length > 0 ? l.effects.join(' ').replace(/"/g, '\\"') : undefined
            };
        });

        processedWedges.push({
            id,
            name: baseName,
            fullName: card.name,
            image: card.mainImage || 'https://dna.interknot-network.com/images/wedges/T_Mod_Cerberus01.webp',
            elementIcon: card.elementIcon,
            trackIcon: card.trackIcon,
            preview,
            stats,
            tolerance: baseLevel.tolerance || 0,
            track: 0, // Not in new format, keeping for compatibility
            rarity: card.rarity,
            type,
            tags: Array.from(tags),
            category,
            element: card.element,
            description,
            canEquipMultiple,
            levels,
        });
    });

    return processedWedges;
}

function generateTypeScript(wedges) {
    let output = `// AUTO-GENERATED from Wedge_Data_Dynamic_Tolerance_2025_Tolerance_update.txt
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

export const allDemonWedges: DemonWedge[] = [
`;

    wedges.forEach(wedge => {
        // Determine usage based on category
        let usage;
        if (wedge.category === 'character') {
            usage = 'Character';
        } else if (wedge.category === 'melee-consonance' || wedge.category === 'ranged-consonance') {
            usage = 'Consonance Weapon';
        } else {
            usage = 'Weapon';
        }

        output += `  {\n`;
        output += `    id: '${wedge.id}',\n`;
        output += `    name: "${wedge.name}",\n`;
        output += `    fullName: "${wedge.fullName}",\n`;
        output += `    image: '${wedge.image}',\n`;
        if (wedge.elementIcon) {
            output += `    elementIcon: '${wedge.elementIcon}',\n`;
        }
        if (wedge.trackIcon) {
            output += `    trackIcon: '${wedge.trackIcon}',\n`;
        }
        if (wedge.preview) {
            output += `    preview: ${JSON.stringify(wedge.preview)},\n`;
        }
        output += `    stats: ${JSON.stringify(wedge.stats)},\n`;
        output += `    tolerance: ${wedge.tolerance},\n`;
        output += `    track: ${wedge.track},\n`;
        output += `    rarity: ${wedge.rarity},\n`;
        output += `    type: '${wedge.type}',\n`;
        output += `    tags: ${JSON.stringify(wedge.tags)},\n`;
        output += `    category: '${wedge.category}',\n`;
        output += `    usage: '${usage}',\n`;
        if (wedge.element) {
            output += `    element: '${wedge.element}',\n`;
        }
        if (wedge.description) {
            output += `    description: "${wedge.description}",\n`;
        }
        if (wedge.canEquipMultiple) {
            output += `    canEquipMultiple: true,\n`;
        }
        if (wedge.levels && wedge.levels.length > 0) {
            output += `    levels: ${JSON.stringify(wedge.levels)},\n`;
        }
        output += `  },\n`;
    });

    output += `];

export function filterDemonWedges(wedges: DemonWedge[], filters: {
  search?: string;
  types?: DemonWedgeType[];
  rarities?: DemonWedgeRarity[];
  elements?: DemonWedgeElement[];
  tags?: string[];
  categories?: DemonWedgeCategory[];
  usage?: DemonWedgeUsage[];
}): DemonWedge[] {
  return wedges.filter(w => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!w.fullName.toLowerCase().includes(s) &&
          !w.stats.some(st => st.name.toLowerCase().includes(s)) &&
          !(w.description?.toLowerCase().includes(s))) return false;
    }
    if (filters.types?.length && !filters.types.includes(w.type)) return false;
    if (filters.rarities?.length && !filters.rarities.includes(w.rarity)) return false;
    if (filters.elements?.length && (!w.element || !filters.elements.includes(w.element))) return false;
    if (filters.tags?.length && !filters.tags.some(t => w.tags.includes(t))) return false;
    if (filters.categories?.length && !filters.categories.includes(w.category)) return false;
    if (filters.usage?.length && !filters.usage.includes(w.usage)) return false;
    return true;
  });
}

export function getAllTags(wedges: DemonWedge[]): string[] {
  const tagSet = new Set<string>();
  wedges.forEach(w => w.tags.forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getAllTypes(wedges: DemonWedge[]): DemonWedgeType[] {
  const typeSet = new Set<DemonWedgeType>();
  wedges.forEach(w => typeSet.add(w.type));
  return Array.from(typeSet).sort();
}

export function getAllElements(wedges: DemonWedge[]): DemonWedgeElement[] {
  const elementSet = new Set<DemonWedgeElement>();
  wedges.forEach(w => { if (w.element) elementSet.add(w.element); });
  return Array.from(elementSet).sort();
}
`;

    return output;
}

// Main execution
try {
    if (!fs.existsSync(NEW_DATA_FILE)) {
        throw new Error(`Data file not found: ${NEW_DATA_FILE}`);
    }

    console.log('Reading data file...');
    const rawText = fs.readFileSync(NEW_DATA_FILE, 'utf8');

    console.log('Parsing cards...');
    const cards = parseCardBlocks(rawText);

    if (!cards.length) {
        throw new Error('No cards parsed from data file');
    }

    console.log(`Parsed ${cards.length} cards`);

    console.log('Processing cards...');
    const processedWedges = processCards(cards);

    console.log('Generating TypeScript file...');
    const output = generateTypeScript(processedWedges);

    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`✅ Successfully generated ${processedWedges.length} demon wedges to ${OUTPUT_FILE}`);
} catch (error) {
    console.error('❌ Error generating demon wedge data:', error);
    process.exit(1);
}
