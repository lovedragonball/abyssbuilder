const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../src/lib/demon-wedges-data.ts');
const DW_INFO_FILE = path.join(__dirname, '../DW_INFO_NEW.txt');
const WEDGE_DUMP_FILE = path.join(__dirname, '../Wedge_Data_2025-11-26T08-30-57-715Z.txt');

const CATEGORY_MAP = new Map([
  ['characters', 'character'],
  ['melee weapon', 'melee-weapon'],
  ['ranged weapon', 'ranged-weapon'],
  ['melee consonance weapon', 'melee-consonance'],
  ['ranged consonance weapon', 'ranged-consonance'],
]);

const ELEMENT_MAP = {
  pyro: 'Pyro',
  hydro: 'Hydro',
  electro: 'Electro',
  lumino: 'Lumino',
  anemo: 'Anemo',
  umbro: 'Umbro',
};

const SYMBOL_MAP = {
  '⊙': 'Circle',
  '◬': 'Diamond',
  '☽': 'Moon',
  '◊': 'Rhombus',
};

const TYPE_TAG_EXCLUSIONS = new Set(['Normal']);

function normalizeElement(raw) {
  if (!raw) return undefined;
  const key = raw.trim().toLowerCase();
  if (key === 'none') return undefined;
  return ELEMENT_MAP[key] || undefined;
}

function inferCategoryFromName(name) {
  const lower = name.toLowerCase();
  if (lower.includes('cerberus') && !lower.includes('eldritch')) return 'melee-consonance';
  if (lower.includes('lilith') && !lower.includes('eldritch')) return 'ranged-consonance';
  if (lower.includes('fenrir')) return 'melee-weapon';
  if (lower.includes('fafnir')) return 'ranged-weapon';
  return 'character';
}

function isVariantLine(line) {
  if (!line) return false;
  if (/^\d+★$/.test(line)) return false;
  if (CATEGORY_MAP.has(line.toLowerCase())) return false;
  if (ELEMENT_MAP[line.toLowerCase()]) return false;
  if (SYMBOL_MAP[line]) return false;
  if (line === 'Main Attribute' || line === 'Effect') return false;
  if (line.startsWith('Tolerance:') || line.startsWith('Track:') || line.startsWith('Source:')) return false;
  if (line === '-' || line === '–' || line === 'None') return false;
  return /^[A-Za-z][A-Za-z0-9\s'&\-\u2022]+$/.test(line);
}

function parseStatLine(line) {
  if (!line || line === '-' || line === '–' || line === 'None') return null;
  const statMatch = line.match(/^(.+?)\s+([+\-][\d\.]+%?(?:.*)?)$/);
  if (!statMatch) return null;
  const name = statMatch[1].trim();
  let value = statMatch[2].trim();
  value = value.replace(/\.$/, '');
  return { name, value };
}

function parseNumericFromLine(line) {
  const value = line.split(':').slice(1).join(':').trim();
  if (!value || value.toLowerCase() === 'none') return 0;
  const numeric = parseFloat(value.replace(/[^\d\.\-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseDwInfoBlocks(rawText) {
  if (!fs.existsSync(DW_INFO_FILE)) return [];
  const blocks = rawText.split(/\r?\n\s*\r?\n/).map(block => block.trim()).filter(Boolean);
  const entries = [];

  blocks.forEach(block => {
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    let idx = 0;
    const baseName = lines[idx++];
    if (!baseName) return;

    let variant;
    while (idx < lines.length && isVariantLine(lines[idx])) {
      variant = variant ? `${variant} ${lines[idx]}` : lines[idx];
      idx++;
    }

    if (idx >= lines.length || !/^\d+★$/.test(lines[idx])) return;
    const rarity = parseInt(lines[idx].replace('★', ''), 10);
    idx++;

    const categoryKey = lines[idx]?.toLowerCase();
    const category = CATEGORY_MAP.get(categoryKey) || 'character';
    idx++;

    let element;
    if (idx < lines.length && ELEMENT_MAP[lines[idx].toLowerCase()]) {
      element = ELEMENT_MAP[lines[idx].toLowerCase()];
      idx++;
    }

    let type = 'Normal';
    if (idx < lines.length && SYMBOL_MAP[lines[idx]]) {
      type = SYMBOL_MAP[lines[idx]];
      idx++;
    }

    if (lines[idx] === 'Main Attribute') idx++;

    const stats = [];
    while (idx < lines.length && lines[idx] !== 'Effect' && !lines[idx].startsWith('Tolerance:') && !lines[idx].startsWith('Track:') && !lines[idx].startsWith('Source:')) {
      const stat = parseStatLine(lines[idx]);
      if (stat) stats.push(stat);
      idx++;
    }

    let description;
    if (lines[idx] === 'Effect') {
      idx++;
      const effectParts = [];
      while (idx < lines.length && !lines[idx].startsWith('Tolerance:') && !lines[idx].startsWith('Track:') && !lines[idx].startsWith('Source:')) {
        const text = lines[idx].replace(/^[-–]\s*/, '').trim();
        if (text && text.toLowerCase() !== 'none') effectParts.push(text);
        idx++;
      }
      if (effectParts.length) description = effectParts.join(' ');
    }

    let tolerance = 0;
    let track = 0;
    while (idx < lines.length) {
      const line = lines[idx];
      if (line.startsWith('Tolerance:')) {
        tolerance = parseNumericFromLine(line);
      } else if (line.startsWith('Track:')) {
        track = parseNumericFromLine(line);
      }
      idx++;
    }

    const canEquipMultiple = Boolean(description && description.includes('Once upgraded to +5'));
    const fullName = variant ? `${baseName} - ${variant}` : baseName;

    entries.push({
      baseName,
      fullName,
      rarity,
      category,
      element,
      type,
      stats,
      tolerance,
      track,
      description,
      canEquipMultiple,
    });
  });

  return entries;
}

function parseWedgeDump(rawText) {
  const entries = rawText.split(/-{5,}\r?\n/).map(section => section.trim()).filter(Boolean);
  const wedges = [];

  entries.forEach(section => {
    const lines = section.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const wedge = { stats: [] };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.startsWith('Card #')) continue;
      if (line.startsWith('Name:')) {
        wedge.fullName = line.replace('Name:', '').trim();
      } else if (line.startsWith('Rarity:')) {
        const rarityMatch = line.match(/(\d)★/);
        wedge.rarity = rarityMatch ? parseInt(rarityMatch[1], 10) : 2;
      } else if (line.startsWith('Element:')) {
        wedge.element = normalizeElement(line.replace('Element:', '').trim());
      } else if (line === 'Stats:' || line === 'Stats') {
        i++;
        while (i < lines.length && lines[i].startsWith('-')) {
          const statLine = lines[i].replace(/^-+\s*/, '').trim();
          const [namePart, valuePart] = statLine.split(':').map(part => part.trim());
          if (namePart && valuePart) {
            wedge.stats.push({ name: namePart, value: valuePart });
          }
          i++;
        }
        i--;
      } else if (line.startsWith('Effect:')) {
        let effect = line.replace('Effect:', '').trim();
        let j = i + 1;
        const effectParts = [effect];
        while (j < lines.length && !lines[j].startsWith('Tolerance:') && !lines[j].startsWith('Track:')) {
          effectParts.push(lines[j]);
          j++;
        }
        wedge.description = effectParts.join(' ').replace(/^-\s*/, '').trim();
        i = j - 1;
      } else if (line.startsWith('Tolerance:')) {
        wedge.tolerance = parseNumericFromLine(line);
      } else if (line.startsWith('Track:')) {
        wedge.track = parseNumericFromLine(line);
      }
    }

    if (!wedge.fullName) return;
    const [baseName, variant] = wedge.fullName.split(' - ').map(part => part.trim());
    wedge.baseName = baseName;
    wedge.variant = variant;
    wedge.track = wedge.track ?? 0;
    wedge.tolerance = wedge.tolerance ?? 0;
    wedges.push(wedge);
  });

  return wedges;
}

function getImageForWedge(wedge) {
  const nameLower = wedge.baseName.toLowerCase();
  if (nameLower.includes('covenanter')) {
    const elementLower = (wedge.element || '').toLowerCase();
    if (elementLower === 'anemo') return 'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_anemo.png';
    if (elementLower === 'electro') return 'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_electro_v1.png';
    if (elementLower === 'pyro') return 'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_pyro_v1.png';
    if (elementLower === 'hydro') return 'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_hydro_v1.png';
    if (elementLower === 'umbro') return 'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_umbro_v1.png';
    return 'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_lumino.png';
  }
  if (nameLower.includes('cerberus')) {
    return nameLower.includes('eldritch')
      ? 'https://dna.interknot-network.com/images/wedges/T_Mod_Cerberus02.webp'
      : 'https://dna.interknot-network.com/images/wedges/T_Mod_Cerberus01.webp';
  }
  if (nameLower.includes('lilith')) {
    return nameLower.includes('eldritch')
      ? 'https://dna.interknot-network.com/images/wedges/T_Mod_Cerberus02.webp'
      : 'https://dna.interknot-network.com/images/wedges/T_Mod_Cerberus01.webp';
  }
  if (nameLower.includes('arbiter')) return 'https://dna.interknot-network.com/images/wedges/T_Mod_Anubis01_Purple.webp';
  if (nameLower.includes('bahamut')) return 'https://dna.interknot-network.com/images/wedges/T_Mod_Bahamut01.webp';
  if (nameLower.includes('hastur')) return 'https://dna.interknot-network.com/images/wedges/T_Mod_Hastur01.webp';
  if (nameLower.includes('helios')) return 'https://dna.interknot-network.com/images/wedges/T_Mod_Yatagarasu01.webp';
  if (nameLower.includes('ifrit')) return 'https://dna.interknot-network.com/images/wedges/T_Mod_Ifrit01_Red.webp';
  if (nameLower.includes('summanus')) return 'https://dna.interknot-network.com/images/wedges/T_Mod_Summanus01.webp';
  return 'https://dna.interknot-network.com/images/wedges/T_Mod_Cerberus01.webp';
}

function getPreviewForWedge(wedge) {
  if (!wedge.baseName.toLowerCase().includes('covenanter')) return undefined;
  return [
    'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_lumino.png',
    'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_anemo.png',
    'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_electro_v1.png',
    'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_pyro_v1.png',
    'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_hydro_v1.png',
    'https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_umbro_v1.png',
  ];
}

function formatDescription(text) {
  if (!text || text === '-' || text === '–') return undefined;
  return text.replace(/"/g, '\\"');
}

function loadDwInfoMetadata() {
  if (!fs.existsSync(DW_INFO_FILE)) return new Map();
  const rawDwInfo = fs.readFileSync(DW_INFO_FILE, 'utf8');
  const entries = parseDwInfoBlocks(rawDwInfo);
  const map = new Map();
  entries.forEach(entry => {
    map.set(entry.fullName, entry);
  });
  return map;
}

try {
  if (!fs.existsSync(WEDGE_DUMP_FILE)) {
    throw new Error('Wedge data dump not found');
  }

  const dwInfoMap = loadDwInfoMetadata();
  const wedgeDump = parseWedgeDump(fs.readFileSync(WEDGE_DUMP_FILE, 'utf8'));

  if (!wedgeDump.length) {
    throw new Error('No wedges parsed from Wedge data dump');
  }

  const processedWedges = wedgeDump.map((entry, index) => {
    const id = `dw-${index + 1}`;
    const lookupName = entry.fullName || entry.baseName;
    const metadata = dwInfoMap.get(lookupName) || dwInfoMap.get(entry.baseName);

    const type = metadata?.type || 'Normal';
    const category = metadata?.category || inferCategoryFromName(entry.baseName);
    const element = entry.element || metadata?.element;
    const description = formatDescription(entry.description || metadata?.description);
    const canEquipMultiple = Boolean((description || '').includes('Once upgraded to +5'));

    const preview = getPreviewForWedge(entry);
    const tags = new Set();
    if (!TYPE_TAG_EXCLUSIONS.has(type)) tags.add(type);
    if (entry.variant) tags.add(entry.variant);
    if (entry.baseName.includes('Prime')) tags.add('Prime');
    if (entry.baseName.includes('Eldritch')) tags.add('Eldritch');

    return {
      id,
      name: entry.baseName,
      fullName: entry.fullName,
      image: getImageForWedge(entry),
      preview,
      stats: entry.stats.length ? entry.stats : metadata?.stats || [],
      tolerance: entry.tolerance,
      track: entry.track,
      rarity: entry.rarity,
      type,
      tags: Array.from(tags),
      category,
      element,
      description,
      canEquipMultiple,
    };
  });

  let output = `// AUTO-GENERATED from Wedge_Data_2025-11-26T08-30-57-715Z.txt
export type DemonWedgeRarity = 2 | 3 | 4 | 5;
export type DemonWedgeType = 'Circle' | 'Diamond' | 'Moon' | 'Rhombus' | 'Normal';
export type DemonWedgeElement = 'Pyro' | 'Hydro' | 'Electro' | 'Lumino' | 'Anemo' | 'Umbro';
export type DemonWedgeCategory = 'character' | 'melee-weapon' | 'ranged-weapon' | 'melee-consonance' | 'ranged-consonance';

export interface DemonWedgeStat { name: string; value: string; }

export interface DemonWedge {
  id: string;
  name: string;
  fullName: string;
  image: string;
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
}

export const allDemonWedges: DemonWedge[] = [
`;

  processedWedges.forEach(wedge => {
    output += `  {\n`;
    output += `    id: '${wedge.id}',\n`;
    output += `    name: "${wedge.name}",\n`;
    output += `    fullName: "${wedge.fullName}",\n`;
    output += `    image: '${wedge.image}',\n`;
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
    if (wedge.element) {
      output += `    element: '${wedge.element}',\n`;
    }
    if (wedge.description) {
      output += `    description: "${wedge.description}",\n`;
    }
    if (wedge.canEquipMultiple) {
      output += `    canEquipMultiple: true,\n`;
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

  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`Successfully generated ${processedWedges.length} demon wedges to ${OUTPUT_FILE}`);
} catch (error) {
  console.error('Error generating demon wedge data:', error);
  process.exit(1);
}
