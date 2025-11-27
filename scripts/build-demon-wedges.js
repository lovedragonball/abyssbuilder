const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(__dirname, '..');
const dynamicPath = path.join(projectRoot, 'Wedge_Data_Dynamic_Tolerance_2025_Tolerance_update.txt');
const dataFilePath = path.join(projectRoot, 'src', 'lib', 'demon-wedges-data.ts');
const legacyDataPath = path.join(projectRoot, 'legacy_demon_wedges_data.ts');

const POLARITY_MAP = {
  1: 'Circle',
  2: 'Diamond',
  3: 'Moon',
  4: 'Rhombus',
};

const ELEMENT_MAP = {
  pyro: 'Pyro',
  hydro: 'Hydro',
  electro: 'Electro',
  lumino: 'Lumino',
  anemo: 'Anemo',
  umbro: 'Umbro',
};

function readFileSafe(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function extractOldData(raw, { isPartial } = { isPartial: false }) {
  if (isPartial) {
    let trimmed = raw.trim();
    if (trimmed.endsWith('];')) {
      trimmed = trimmed.slice(0, -2).trim();
    }
    const wrapped = `[${trimmed.replace(/,\s*$/, '')}]`;
    const script = new vm.Script(`(${wrapped})`);
    const data = script.runInNewContext({});
    return { data };
  }

  const startToken = 'export const allDemonWedges';
  const startIdx = raw.indexOf(startToken);
  if (startIdx === -1) throw new Error('Unable to locate allDemonWedges export');
  const arrayStart = raw.indexOf('[', startIdx);
  let depth = 0;
  let endIdx = -1;
  for (let i = arrayStart; i < raw.length; i++) {
    const char = raw[i];
    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx === -1) throw new Error('Unable to find end of data array');
  const arrayText = raw.slice(arrayStart, endIdx + 1);
  const context = {};
  const script = new vm.Script(`(${arrayText})`);
  const data = script.runInNewContext(context);
  return { data: script.runInNewContext({}) };
}

function parseDynamicDataset(raw) {
  const cards = new Map();
  const cardRegex = /=== CARD #\d+ START ===([\s\S]*?)=== CARD #\d+ END ===/g;
  let match;
  while ((match = cardRegex.exec(raw)) !== null) {
    const block = match[1];
    const nameLine = block.match(/Name:\s*(.+)/);
    if (!nameLine) continue;
    const fullName = nameLine[1].trim();
    const rarityMatch = block.match(/Rarity:\s*(\d+)/);
    const rarity = rarityMatch ? Number(rarityMatch[1]) : undefined;
    const elementLine = block.match(/Element:\s*(.+)/);
    const elementRaw = elementLine ? elementLine[1].trim().toLowerCase() : undefined;
    const element = ELEMENT_MAP[elementRaw] ?? undefined;

    const mainImage = block.match(/1\. Main Image:\s*(.+)/)?.[1]?.trim() ?? '';
    const elementIcon = block.match(/2\. Element Icon:\s*(.+)/)?.[1]?.trim();
    const trackIcon = block.match(/3\. Track Icon:\s*(.+)/)?.[1]?.trim();
    const polarityMatch = trackIcon ? trackIcon.match(/(\d+)(?=\.webp)/) : null;
    const polarityNumber = polarityMatch ? Number(polarityMatch[1]) : undefined;
    const typeFromIcon = polarityNumber ? POLARITY_MAP[polarityNumber] : undefined;

    const levels = parseLevels(block);
    const baseName = fullName.includes(' - ') ? fullName.split(' - ')[0] : fullName;

    cards.set(fullName, {
      fullName,
      baseName,
      rarity,
      element,
      image: mainImage,
      elementIcon: elementIcon && elementIcon !== 'None' ? elementIcon : undefined,
      trackIcon: trackIcon && trackIcon !== 'None' ? trackIcon : undefined,
      type: typeFromIcon,
      levels,
      preview: mainImage ? [mainImage] : [],
    });
  }
  return cards;
}

function parseLevels(block) {
  const dataPart = block.split('[Game Data]')[1];
  if (!dataPart) return [];
  const levels = [];
  const levelRegex = /--- (Base Level|Level \+(\d+)) ---([\s\S]*?)(?=(---|=== CARD|$))/g;
  let match;
  while ((match = levelRegex.exec(dataPart)) !== null) {
    const [, label, levelStr, body] = match;
    const level = label === 'Base Level' ? 0 : Number(levelStr);
    const stats = [];
    let tolerance;
    let description;
    body
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-'))
      .forEach(line => {
        const cleaned = line.replace(/^-+\s*/, '');
        const colonIdx = cleaned.indexOf(':');
        if (colonIdx === -1) return;
        const key = cleaned.slice(0, colonIdx).trim();
        const value = cleaned.slice(colonIdx + 1).trim();
        if (!value) return;
        if (/^Tolerance/i.test(key)) {
          const numeric = Number(value);
          tolerance = Number.isNaN(numeric) ? undefined : numeric;
        } else if (/^Effect/i.test(key)) {
          description = value;
        } else {
          stats.push({ name: key, value });
        }
      });
    levels.push({ level, tolerance, stats, description });
  }
  return levels.sort((a, b) => a.level - b.level);
}

function deriveTags(fullName, fallback = []) {
  if (fallback.length) return fallback;
  if (fullName.includes(' - ')) {
    const suffix = fullName.split(' - ')[1]?.trim();
    if (suffix) return [suffix];
  }
  return [];
}

function normalizeLevels(levels, fallbackTolerance, fallbackStats, fallbackDescription) {
  if (!levels.length) {
    return [
      {
        level: 0,
        tolerance: fallbackTolerance,
        stats: fallbackStats ?? [],
        description: fallbackDescription,
      },
    ];
  }
  return levels.map((lvl, index) => ({
    level: lvl.level ?? index,
    tolerance: lvl.tolerance ?? fallbackTolerance,
    stats: lvl.stats?.length ? lvl.stats : fallbackStats ?? [],
    description: lvl.description ?? (index === 0 ? fallbackDescription : undefined),
  }));
}

function mergeEntry(oldEntry, dynamicEntry) {
  const levels = normalizeLevels(
    dynamicEntry?.levels ?? [],
    oldEntry.tolerance,
    oldEntry.stats,
    oldEntry.description
  );
  const baseLevel = levels[0] ?? { level: 0, stats: oldEntry.stats, tolerance: oldEntry.tolerance };
  return {
    ...oldEntry,
    name: dynamicEntry?.baseName ?? oldEntry.name,
    fullName: dynamicEntry?.fullName ?? oldEntry.fullName,
    image: dynamicEntry?.image || oldEntry.image,
    preview: dynamicEntry?.preview?.length ? dynamicEntry.preview : oldEntry.preview,
    stats: baseLevel.stats,
    tolerance: baseLevel.tolerance ?? oldEntry.tolerance,
    rarity: dynamicEntry?.rarity ?? oldEntry.rarity,
    type: dynamicEntry?.type ?? oldEntry.type,
    element: dynamicEntry?.element ?? oldEntry.element,
    description: baseLevel.description ?? oldEntry.description,
    tags: deriveTags(oldEntry.fullName, oldEntry.tags),
    levels,
  };
}

function augmentLegacyEntry(entry) {
  const levels = [
    {
      level: 0,
      tolerance: entry.tolerance,
      stats: entry.stats,
      description: entry.description,
    },
  ];
  return { ...entry, levels };
}

function nextIdFactory(data) {
  let maxId = 0;
  data.forEach(item => {
    const numeric = Number(item.id?.replace('dw-', ''));
    if (!Number.isNaN(numeric)) {
      maxId = Math.max(maxId, numeric);
    }
  });
  return () => {
    maxId += 1;
    return `dw-${maxId}`;
  };
}

const HELPERS = `export function filterDemonWedges(wedges: DemonWedge[], filters: {
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

function build() {
  const dynamicRaw = readFileSafe(dynamicPath);
  const dynamicMap = parseDynamicDataset(dynamicRaw);
  const metadataSource = fs.existsSync(legacyDataPath) ? legacyDataPath : dataFilePath;
  const oldRaw = readFileSafe(metadataSource);
  const { data: oldData } = extractOldData(oldRaw, { isPartial: metadataSource === legacyDataPath });
  const dynamicUsed = new Set();

  const merged = oldData.map(entry => {
    const dynamic = dynamicMap.get(entry.fullName);
    if (dynamic) dynamicUsed.add(entry.fullName);
    const mergedEntry = dynamic ? mergeEntry(entry, dynamic) : augmentLegacyEntry(entry);
    return mergedEntry;
  });

  const getNextId = nextIdFactory(merged);

  dynamicMap.forEach((dynamic, fullName) => {
    if (dynamicUsed.has(fullName)) return;
    const newEntry = {
      id: getNextId(),
      name: dynamic.baseName,
      fullName: dynamic.fullName,
      image: dynamic.image,
      stats: dynamic.levels[0]?.stats ?? [],
      tolerance: dynamic.levels[0]?.tolerance ?? 0,
      track: 0,
      rarity: dynamic.rarity ?? 2,
      type: dynamic.type ?? 'Normal',
      element: dynamic.element,
      tags: deriveTags(dynamic.fullName, []),
      category: 'character',
      description: dynamic.levels[0]?.description,
      levels: normalizeLevels(dynamic.levels, 0, [], dynamic.levels[0]?.description),
    };
    merged.push(newEntry);
  });

  const header = `// AUTO-GENERATED from ${path.basename(dynamicPath)}\n` +
`export type DemonWedgeRarity = 2 | 3 | 4 | 5;\n` +
`export type DemonWedgeType = 'Circle' | 'Diamond' | 'Moon' | 'Rhombus' | 'Normal';\n` +
`export type DemonWedgeElement = 'Pyro' | 'Hydro' | 'Electro' | 'Lumino' | 'Anemo' | 'Umbro';\n` +
`export type DemonWedgeCategory = 'character' | 'melee-weapon' | 'ranged-weapon' | 'melee-consonance' | 'ranged-consonance';\n\n` +
`export interface DemonWedgeStat { name: string; value: string; }\n` +
`export interface DemonWedgeLevel { level: number; tolerance?: number; stats: DemonWedgeStat[]; description?: string; }\n\n` +
`export interface DemonWedge {\n` +
`  id: string;\n` +
`  name: string;\n` +
`  fullName: string;\n` +
`  image: string;\n` +
`  preview?: string[];\n` +
`  stats: DemonWedgeStat[];\n` +
`  tolerance: number;\n` +
`  track: number;\n` +
`  rarity: DemonWedgeRarity;\n` +
`  type: DemonWedgeType;\n` +
`  element?: DemonWedgeElement;\n` +
`  tags: string[];\n` +
`  description?: string;\n` +
`  canEquipMultiple?: boolean;\n` +
`  category: DemonWedgeCategory;\n` +
`  levels: DemonWedgeLevel[];\n` +
`}\n`;

  const arrayContent = JSON.stringify(merged, null, 2);
  const fileContent = `${header}\nexport const allDemonWedges: DemonWedge[] = ${arrayContent};\n\n${HELPERS.trim()}\n`;
  fs.writeFileSync(dataFilePath, fileContent, 'utf8');
  console.log(`Updated ${dataFilePath} with ${merged.length} entries.`);
}

build();

