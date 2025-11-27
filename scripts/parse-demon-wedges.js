// Parse demon wedges data from raw text input
// This script will help convert the user's raw data into structured TypeScript

const fs = require('fs');
const path = require('path');

// Raw data will be pasted here - this is sample data
const rawData = `
Cerberus's Crusher - Trammel
Smash ATK
20%
Trigger Probability
40%
Tolerance
9
`;

function parseWedgeEntry(lines, startIndex) {
    const wedge = {
        name: '',
        stats: [],
        tolerance: 0,
        track: 0 // Will be set based on "Track" keyword
    };

    wedge.name = lines[startIndex].trim();

    let i = startIndex + 1;
    while (i < lines.length && lines[i].trim() !== 'Tolerance' && lines[i].trim() !== 'Track') {
        const statName = lines[i].trim();
        if (statName && i + 1 < lines.length) {
            const statValue = lines[i + 1].trim();
            if (statValue && !statValue.match(/^[A-Z]/)) {
                wedge.stats.push({
                    name: statName,
                    value: statValue
                });
                i += 2;
            } else {
                i++;
            }
        } else {
            i++;
        }
    }

    // Parse tolerance
    if (i < lines.length && lines[i].trim() === 'Tolerance') {
        wedge.tolerance = parseInt(lines[i + 1].trim(), 10);
        i += 2;
    }

    // Check for Track keyword
    if (i < lines.length && lines[i].trim() === 'Track') {
        wedge.track = 1;
        i++;
    }

    return { wedge, nextIndex: i };
}

// This is a helper - actual parsing will be done manually
// since the data structure is complex
console.log('Demon wedge parser ready');
console.log('Due to the complexity and volume of data, proceeding with manual structured data creation');
