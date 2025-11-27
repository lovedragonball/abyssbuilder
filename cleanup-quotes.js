const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\chawa\\Downloads\\AbyssBuilder\\src\\app\\view\\[id]\\page.tsx';

// Read the original file
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original file size:', content.length);

// Fix escaped quotes from previous attempt
content = content.replace(/\\"/g, '"');
content = content.replace(/\\'/g, "'");

console.log('After fixing escaped quotes');

// Save the fixed file
fs.writeFileSync(filePath, content, 'utf8');
console.log('File has been cleaned up');
console.log('New file size:', content.length);
