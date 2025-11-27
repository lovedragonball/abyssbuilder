const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/demon-wedges-data.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Count occurrences of demon wedge IDs that contain "Covenanter"
const wedgePattern = /{\s*id:\s*'dw-\d+',\s*name:\s*"([^"]*Covenanter[^"]*)"/g;
const matches = [];
let match;

while ((match = wedgePattern.exec(content)) !== null) {
    matches.push(match[1]);
}

console.log('Total Covenanter wedges found:', matches.length);
console.log('\nFirst 5:');
matches.slice(0, 5).forEach((name, i) => console.log(`  ${i + 1}. ${name}`));
console.log('\nLast 5:');
matches.slice(-5).forEach((name, i) => console.log(`  ${matches.length - 4 + i}. ${name}`));

// Check if they all have preview arrays
const withPreview = content.match(/name:\s*"[^"]*Covenanter[^"]*"[\s\S]*?preview:\s*\[/g);
console.log('\nCovenanter wedges with preview array:', withPreview ? withPreview.length : 0);
