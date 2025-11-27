const fs = require('fs');

// Paste the complete raw data here
const rawData = `(ข้อมูลที่คุณให้มาทั้งหมด จะถูกใส่ที่นี่)`;

// Parse function
function parseWedgeData(text) {
    const wedges = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    let i = 0;
    while (i < lines.length) {
        const nameLine = lines[i];
        if (!nameLine || nameLine === 'Track' || nameLine === 'Amplification') {
            i++;
            continue;
        }

        const wedge = { name: nameLine, stats: [], tolerance: 0, track: 0, tags: [] };
        i++;

        // Parse stats
        while (i < lines.length && !lines[i].includes('Tolerance')) {
            if (lines[i] !== 'Track' && lines[i] !== 'Amplification' && !lines[i].includes('%') && !lines[i].includes('increase') && !lines[i].includes('Upgrade')) {
                const statName = lines[i];
                i++;
                if (i < lines.length) {
                    wedge.stats.push({ name: statName, value: lines[i] });
                    i++;
                }
            } else if (lines[i].length > 30) {
                wedge.description = lines[i];
                i++;
            } else {
                i++;
            }
        }

        // Parse tolerance
        if (i < lines.length && lines[i] === 'Tolerance') {
            i++;
            wedge.tolerance = parseInt(lines[i]);
            i++;
        }

        // Check for Track/Amplification
        if (i < lines.length) {
            if (lines[i] === 'Track') {
                wedge.track = 1;
                wedge.type = 'Track';
                i++;
            } else if (lines[i] === 'Amplification') {
                wedge.type = 'Amplification';
                wedge.track = 1;
                i++;
                if (i < lines.length && lines[i] === 'Track') i++;
            } else {
                wedge.type = 'Normal';
            }
        }

        // Determine rarity, category, element
        if (nameLine.includes('Prime')) wedge.rarity = 5;
        else if (nameLine.includes('Eldritch') || nameLine.includes('Griffin') || nameLine.includes('Phoenix') || nameLine.includes('Siren') || nameLine.includes('Sphinx') || nameLine.includes('Arbiter') || nameLine.includes('Bahamut') || nameLine.includes('Ifrit') || nameLine.includes('Summanus') || nameLine.includes('Helios') || nameLine.includes('Hastur')) wedge.rarity = 4;
        else if (wedge.tolerance >= 15) wedge.rarity = 4;
        else if (wedge.tolerance >= 10) wedge.rarity = 3;
        else wedge.rarity = 2;

        if (nameLine.includes('Cerberus') && !nameLine.includes("Eldritch")) wedge.category = 'melee-consonance';
        else if (nameLine.includes('Lilith') && !nameLine.includes("Eldritch")) wedge.category = 'ranged-consonance';
        else if (nameLine.includes('Fenrir')) wedge.category = 'melee-weapon';
        else if (nameLine.includes('Fafnir')) wedge.category = 'ranged-weapon';
        else wedge.category = 'character';

        if (nameLine.includes('Pyro') || nameLine.includes('Inferno') || nameLine.includes('Ignite') || nameLine.includes('Ifrit')) wedge.element = 'Pyro';
        else if (nameLine.includes('Hydro') || nameLine.includes('Seawave') || nameLine.includes('Bahamut')) wedge.element = 'Hydro';
        else if (nameLine.includes('Electro') || nameLine.includes('Thunder') || nameLine.includes('Summanus')) wedge.element = 'Electro';
        else if (nameLine.includes('Lumino') || nameLine.includes('Skylume') || nameLine.includes('Helios')) wedge.element = 'Lumino';
        else if (nameLine.includes('Anemo') || nameLine.includes('Squall') || nameLine.includes('Helido') || nameLine.includes('Hastur')) wedge.element = 'Anemo';
        else if (nameLine.includes('Umbro') || nameLine.includes('Nihility') || nameLine.includes('Arbiter')) wedge.element = 'Umbro';

        if (nameLine.includes('Covenanter')) wedge.canEquipMultiple = true;

        wedges.push(wedge);
    }

    return wedges;
}

// Generate TypeScript
function generateTS(wedges) {
    let ts = `// AUTO-GENERATED - Complete Demon Wedges Database
export type DemonWedgeRarity = 2 | 3 | 4 | 5;
export type DemonWedgeType = 'Trammel' | 'Focus' | 'Track' | 'Prime' | 'Amplification' | 'Normal';
export type DemonWedgeElement = 'Pyro' | 'Hydro' | 'Electro' | 'Lumino' | 'Anemo' | 'Umbro';
export type DemonWedgeCategory = 'character' | 'melee-weapon' | 'ranged-weapon' | 'melee-consonance' | 'ranged-consonance';

export interface DemonWedgeStat { name: string; value: string; }

export interface DemonWedge {
  id: string; name: string; fullName: string; image: string; stats: DemonWedgeStat[];
  tolerance: number; track: number; rarity: DemonWedgeRarity; type: DemonWedgeType;
  element?: DemonWedgeElement; tags: string[]; description?: string;
  canEquipMultiple?: boolean; category: DemonWedgeCategory;
}

export const allDemonWedges: DemonWedge[] = [\n`;

    wedges.forEach((w, idx) => {
        const id = `dw-${idx + 1}`;
        const stats = JSON.stringify(w.stats);
        const tags = JSON.stringify(w.tags || []);
        const elem = w.element ? `'${w.element}'` : 'undefined';
        const desc = w.description ? `'${w.description.replace(/'/g, "\\'")}'` : 'undefined';
        const multi = w.canEquipMultiple ? 'true' : 'undefined';

        ts += `  {id:'${id}',name:'${w.name}',fullName:"${w.name}",image:'/DW Image/${w.category}/${id}.png',stats:${stats},tolerance:${w.tolerance},track:${w.track},rarity:${w.rarity},type:'${w.type}',tags:${tags},category:'${w.category}',element:${elem},description:${desc},canEquipMultiple:${multi}},\n`;
    });

    ts += `];\n\nexport function filterDemonWedges(wedges: DemonWedge[], filters: {
  search?: string; types?: DemonWedgeType[]; rarities?: DemonWedgeRarity[];
  elements?: DemonWedgeElement[]; tags?: string[]; categories?: DemonWedgeCategory[];
}): DemonWedge[] {
  return wedges.filter(w => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!w.fullName.toLowerCase().includes(s) && !w.stats.some(st => st.name.toLowerCase().includes(s)) && !(w.description?.toLowerCase().includes(s))) return false;
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
}\n`;

    return ts;
}

console.log('Parsing wedge data...');
const wedges = parseWedgeData(rawData);
console.log(`Found ${wedges.length} wedges`);

const tsCode = generateTS(wedges);
fs.writeFileSync('../src/lib/demon-wedges-data.ts', tsCode);
console.log('✅ Generated demon-wedges-data.ts with', wedges.length, 'items');
