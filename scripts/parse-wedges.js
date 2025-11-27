const fs = require('fs');
const path = require('path');

// Read raw data
const rawPath = path.join(__dirname, 'raw-wedges.txt');
const rawData = fs.readFileSync(rawPath, 'utf-8');

function parseWedges(text) {
    const wedges = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let i = 0;
    while (i < lines.length) {
        const name = lines[i];
        // skip if it's a section header like "Track" or "Amplification"
        if (name === 'Track' || name === 'Amplification') { i++; continue; }
        const wedge = { name, stats: [], tolerance: 0, track: 0, tags: [] };
        i++;
        // collect stats until we hit "Tolerance" or a new wedge name (contains "'" and space)
        while (i < lines.length && lines[i] !== 'Tolerance' && lines[i] !== 'Track' && lines[i] !== 'Amplification') {
            const statName = lines[i];
            // next line is value (could be % or number or text)
            if (i + 1 < lines.length) {
                const value = lines[i + 1];
                wedge.stats.push({ name: statName, value });
                i += 2;
            } else {
                i++;
            }
        }
        // tolerance
        if (i < lines.length && lines[i] === 'Tolerance') {
            i++;
            wedge.tolerance = parseInt(lines[i]) || 0;
            i++;
        }
        // check following token for Track / Amplification
        if (i < lines.length && (lines[i] === 'Track' || lines[i] === 'Amplification')) {
            if (lines[i] === 'Track') {
                wedge.type = 'Track';
                wedge.track = 1;
                i++;
            } else if (lines[i] === 'Amplification') {
                wedge.type = 'Amplification';
                wedge.track = 1;
                i++;
                // possible trailing Track token
                if (i < lines.length && lines[i] === 'Track') i++;
            }
        } else {
            wedge.type = 'Normal';
        }

        // infer rarity (simple heuristic)
        if (name.includes('Prime') || name.includes('Arbiter') || name.includes('Bahamut') || name.includes('Ifrit') || name.includes('Summanus') || name.includes('Helios') || name.includes('Hastur')) {
            wedge.rarity = 5;
        } else if (name.includes('Eldritch') || name.includes('Griffin') || name.includes('Phoenix') || name.includes('Siren') || name.includes('Sphinx')) {
            wedge.rarity = 4;
        } else if (wedge.tolerance >= 15) {
            wedge.rarity = 4;
        } else if (wedge.tolerance >= 10) {
            wedge.rarity = 3;
        } else {
            wedge.rarity = 2;
        }

        // category inference
        if (name.includes('Cerberus') && !name.includes('Eldritch')) wedge.category = 'melee-consonance';
        else if (name.includes('Lilith') && !name.includes('Eldritch')) wedge.category = 'ranged-consonance';
        else if (name.includes('Fenrir')) wedge.category = 'melee-weapon';
        else if (name.includes('Fafnir')) wedge.category = 'ranged-weapon';
        else if (name.includes('Covenanter')) wedge.category = 'character';
        else if (name.includes('Jormungand')) wedge.category = 'character';
        else wedge.category = 'character';

        // element inference (basic)
        if (name.match(/Pyro|Inferno|Ignite|Ifrit/i)) wedge.element = 'Pyro';
        else if (name.match(/Hydro|Seawave|Bahamut/i)) wedge.element = 'Hydro';
        else if (name.match(/Electro|Thunder|Summanus/i)) wedge.element = 'Electro';
        else if (name.match(/Lumino|Skylume|Helios/i)) wedge.element = 'Lumino';
        else if (name.match(/Anemo|Squall|Helido|Hastur/i)) wedge.element = 'Anemo';
        else if (name.match(/Umbro|Nihility|Arbiter/i)) wedge.element = 'Umbro';

        // can equip multiple for Covenanter series
        if (name.includes('Covenanter')) wedge.canEquipMultiple = true;

        wedges.push(wedge);
    }
    return wedges;
}

function generateTS(wedges) {
    let ts = `// AUTO-GENERATED DEMON WEDGES DATA\n`;
    ts += `export type DemonWedgeRarity = 2 | 3 | 4 | 5;\n`;
    ts += `export type DemonWedgeType = 'Track' | 'Amplification' | 'Normal';\n`;
    ts += `export type DemonWedgeElement = 'Pyro' | 'Hydro' | 'Electro' | 'Lumino' | 'Anemo' | 'Umbro';\n`;
    ts += `export type DemonWedgeCategory = 'character' | 'melee-weapon' | 'ranged-weapon' | 'melee-consonance' | 'ranged-consonance';\n`;
    ts += `\nexport interface DemonWedgeStat { name: string; value: string; }\n`;
    ts += `export interface DemonWedge {\n  id: string; name: string; fullName: string; image: string; stats: DemonWedgeStat[];\n  tolerance: number; track: number; rarity: DemonWedgeRarity; type: DemonWedgeType;\n  element?: DemonWedgeElement; tags: string[]; description?: string;\n  canEquipMultiple?: boolean; category: DemonWedgeCategory;\n}\n\n`;
    ts += `export const allDemonWedges: DemonWedge[] = [\n`;
    wedges.forEach((w, idx) => {
        const id = `dw-${idx + 1}`;
        const stats = JSON.stringify(w.stats);
        const tags = JSON.stringify(w.tags);
        const elem = w.element ? `'${w.element}'` : 'undefined';
        const desc = w.description ? `'${w.description.replace(/'/g, "\\'")}'` : 'undefined';
        const multi = w.canEquipMultiple ? 'true' : 'undefined';
        ts += `  { id: '${id}', name: '${w.name}', fullName: '${w.name}', image: '/DW Image/${w.category}/${id}.png', stats: ${stats}, tolerance: ${w.tolerance}, track: ${w.track}, rarity: ${w.rarity}, type: '${w.type}', tags: ${tags}, category: '${w.category}', element: ${elem}, description: ${desc}, canEquipMultiple: ${multi} },\n`;
    });
    ts += `];\n`;
    // helper functions (same as before)
    ts += `\nexport function filterDemonWedges(wedges: DemonWedge[], filters: { search?: string; types?: DemonWedgeType[]; rarities?: DemonWedgeRarity[]; elements?: DemonWedgeElement[]; tags?: string[]; categories?: DemonWedgeCategory[]; }): DemonWedge[] {\n  return wedges.filter(w => {\n    if (filters.search) {\n      const s = filters.search.toLowerCase();\n      if (!w.fullName.toLowerCase().includes(s) && !w.stats.some(st => st.name.toLowerCase().includes(s)) && !(w.description?.toLowerCase().includes(s))) return false;\n    }\n    if (filters.types?.length && !filters.types.includes(w.type)) return false;\n    if (filters.rarities?.length && !filters.rarities.includes(w.rarity)) return false;\n    if (filters.elements?.length && (!w.element || !filters.elements.includes(w.element))) return false;\n    if (filters.tags?.length && !filters.tags.some(t => w.tags.includes(t))) return false;\n    if (filters.categories?.length && !filters.categories.includes(w.category)) return false;\n    return true;\n  });\n}\n`;
    ts += `\nexport function getAllTags(wedges: DemonWedge[]): string[] { const set = new Set<string>(); wedges.forEach(w => w.tags.forEach(t => set.add(t))); return Array.from(set).sort(); }\n`;
    ts += `\nexport function getAllTypes(wedges: DemonWedge[]): DemonWedgeType[] { const set = new Set<DemonWedgeType>(); wedges.forEach(w => set.add(w.type)); return Array.from(set).sort(); }\n`;
    return ts;
}

const wedges = parseWedges(rawData);
const tsCode = generateTS(wedges);
const outPath = path.join(__dirname, '..', 'src', 'lib', 'demon-wedges-data-full.ts');
fs.writeFileSync(outPath, tsCode, 'utf-8');
console.log('✅ Generated', wedges.length, 'demon wedges to', outPath);
