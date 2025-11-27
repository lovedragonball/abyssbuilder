const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(__dirname, '..');
const datasetPath = path.join(projectRoot, 'Wedge_Dataset_2025_Amplification.txt');
const dataFilePath = path.join(projectRoot, 'src', 'lib', 'demon-wedges-data.ts');

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

function extractCurrentData(raw) {
  // Use the same simple method as build-demon-wedges.js
  const startToken = 'export const allDemonWedges';
  const startIdx = raw.indexOf(startToken);
  if (startIdx === -1) throw new Error('Unable to locate allDemonWedges export');
  
  // Find the actual array start (skip TypeScript type annotation like `: DemonWedge[]`)
  const typeAnnotationEnd = raw.indexOf('=', startIdx);
  if (typeAnnotationEnd === -1) throw new Error('Unable to find = after allDemonWedges');
  const arrayStart = raw.indexOf('[', typeAnnotationEnd);
  if (arrayStart === -1) throw new Error('Unable to find array start');
  
  // Simple bracket matching (same as build-demon-wedges.js)
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
  
  // Use temp file method (more reliable for large arrays)
  const tempFile = path.join(projectRoot, 'temp-demon-wedges-data.js');
  try {
    const jsContent = `module.exports = ${arrayText};`;
    fs.writeFileSync(tempFile, jsContent, 'utf8');
    
    // Clear require cache
    const resolvedPath = require.resolve(tempFile);
    delete require.cache[resolvedPath];
    
    const data = require(tempFile);
    
    // Clean up
    delete require.cache[resolvedPath];
    fs.unlinkSync(tempFile);
    
    if (!Array.isArray(data)) {
      console.warn('Result is not an array, type:', typeof data);
      return [];
    }
    return data;
  } catch (err) {
    if (fs.existsSync(tempFile)) {
      try { 
        const resolvedPath = require.resolve(tempFile);
        delete require.cache[resolvedPath];
        fs.unlinkSync(tempFile); 
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    console.error('Error parsing array:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Array text length:', arrayText.length);
    console.error('Array start position:', arrayStart);
    console.error('Array end position:', endIdx);
    // Try to show where the error might be
    if (err.message && err.message.includes('line')) {
      const match = err.message.match(/line (\d+)/);
      if (match) {
        const lineNum = parseInt(match[1]);
        const lines = arrayText.split('\n');
        const startLine = Math.max(0, lineNum - 5);
        const endLine = Math.min(lines.length, lineNum + 5);
        console.error('Error around line', lineNum, ':');
        console.error(lines.slice(startLine, endLine).join('\n'));
      }
    }
    throw err;
  }
}

function parseDataset(raw) {
  const cards = new Map();
  const cardRegex = /=== CARD #\d+ START ===([\s\S]*?)=== CARD #\d+ END ===/g;
  let match;
  let cardNumber = 0;
  
  while ((match = cardRegex.exec(raw)) !== null) {
    cardNumber++;
    const block = match[1];
    
    // Parse Identity
    const nameLine = block.match(/Name:\s*(.+)/);
    if (!nameLine) {
      console.warn(`Card #${cardNumber}: Missing name`);
      continue;
    }
    const fullName = nameLine[1].trim();
    
    const rarityMatch = block.match(/Rarity:\s*(\d+)/);
    const rarity = rarityMatch ? Number(rarityMatch[1]) : undefined;
    
    const toleranceMatch = block.match(/Tolerance Cost:\s*(\d+)/);
    const tolerance = toleranceMatch ? Number(toleranceMatch[1]) : undefined;
    
    // Parse Visual Assets
    const mainImage = block.match(/1\. Main Image:\s*(.+)/)?.[1]?.trim() ?? '';
    const elementIcon = block.match(/2\. Element Icon:\s*(.+)/)?.[1]?.trim();
    const trackIcon = block.match(/3\. Track Icon:\s*(.+)/)?.[1]?.trim();
    
    // Determine element
    let element = undefined;
    if (elementIcon && elementIcon !== 'None') {
      const elementUrl = elementIcon.toLowerCase();
      for (const [key, value] of Object.entries(ELEMENT_MAP)) {
        if (elementUrl.includes(key)) {
          element = value;
          break;
        }
      }
    }
    
    // Determine type from track icon
    let type = 'Normal';
    if (trackIcon && trackIcon !== 'None') {
      const polarityMatch = trackIcon.match(/(\d+)(?=\.webp)/);
      if (polarityMatch) {
        const polarityNumber = Number(polarityMatch[1]);
        type = POLARITY_MAP[polarityNumber] || 'Normal';
      }
    }
    
    // Parse Game Data
    const dataPart = block.split('[Game Data]')[1];
    const stats = [];
    let description = undefined;
    
    if (dataPart) {
      // Parse Base Level stats
      const baseLevelMatch = dataPart.match(/--- Base Level ---([\s\S]*?)(?=(---|===|$))/);
      if (baseLevelMatch) {
        const baseLevelContent = baseLevelMatch[1];
        const statLines = baseLevelContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('-'));
        
        statLines.forEach(line => {
          const cleaned = line.replace(/^-+\s*/, '');
          const colonIdx = cleaned.indexOf(':');
          if (colonIdx === -1) {
            // Check if it's an Effect line without colon
            if (cleaned.startsWith('Effect:')) {
              description = cleaned.replace(/^Effect:\s*/, '').trim();
            }
            return;
          }
          const key = cleaned.slice(0, colonIdx).trim();
          const value = cleaned.slice(colonIdx + 1).trim();
          
          if (key.toLowerCase() === 'effect') {
            description = value;
          } else if (value) {
            stats.push({ name: key, value });
          }
        });
      }
    }
    
    const baseName = fullName.includes(' - ') ? fullName.split(' - ')[0] : fullName;
    
    cards.set(fullName, {
      cardNumber,
      fullName,
      baseName,
      rarity,
      tolerance,
      element,
      image: mainImage,
      elementIcon: elementIcon && elementIcon !== 'None' ? elementIcon : undefined,
      trackIcon: trackIcon && trackIcon !== 'None' ? trackIcon : undefined,
      type,
      stats,
      description,
    });
  }
  
  return cards;
}

function normalizeName(name) {
  return name.trim();
}

function compareStats(stats1, stats2) {
  if (stats1.length !== stats2.length) return false;
  const sorted1 = [...stats1].sort((a, b) => a.name.localeCompare(b.name));
  const sorted2 = [...stats2].sort((a, b) => a.name.localeCompare(b.name));
  return sorted1.every((stat, i) => 
    stat.name === sorted2[i].name && stat.value === sorted2[i].value
  );
}

function verifyData() {
  console.log('🔍 Starting verification...\n');
  
  // Read files
  const datasetRaw = readFileSafe(datasetPath);
  const currentDataRaw = readFileSafe(dataFilePath);
  
  console.log(`Dataset file size: ${datasetRaw.length} chars`);
  console.log(`Current data file size: ${currentDataRaw.length} chars`);
  
  // Parse data
  const datasetCards = parseDataset(datasetRaw);
  
  let currentData;
  try {
    currentData = extractCurrentData(currentDataRaw);
  } catch (error) {
    console.error('Failed to extract current data:', error.message);
    throw error;
  }
  
  console.log(`📊 Dataset cards: ${datasetCards.size}`);
  console.log(`📊 Current data cards: ${currentData.length}\n`);
  
  const issues = [];
  const verified = [];
  const missing = [];
  
  // Create a map of current data by fullName
  const currentDataMap = new Map();
  currentData.forEach(wedge => {
    const key = normalizeName(wedge.fullName);
    if (currentDataMap.has(key)) {
      issues.push({
        type: 'duplicate',
        name: wedge.fullName,
        message: 'Duplicate fullName in current data'
      });
    }
    currentDataMap.set(key, wedge);
  });
  
  // Verify each dataset card
  for (const [fullName, datasetCard] of datasetCards.entries()) {
    const normalizedName = normalizeName(fullName);
    const currentCard = currentDataMap.get(normalizedName);
    
    if (!currentCard) {
      missing.push({
        cardNumber: datasetCard.cardNumber,
        fullName,
        message: 'Card not found in current data'
      });
      continue;
    }
    
    const cardIssues = [];
    
    // Check rarity
    if (datasetCard.rarity !== currentCard.rarity) {
      cardIssues.push({
        field: 'rarity',
        expected: datasetCard.rarity,
        actual: currentCard.rarity
      });
    }
    
    // Check tolerance
    if (datasetCard.tolerance !== currentCard.tolerance) {
      cardIssues.push({
        field: 'tolerance',
        expected: datasetCard.tolerance,
        actual: currentCard.tolerance
      });
    }
    
    // Check element
    if (datasetCard.element !== currentCard.element) {
      cardIssues.push({
        field: 'element',
        expected: datasetCard.element || 'None',
        actual: currentCard.element || 'None'
      });
    }
    
    // Check type
    if (datasetCard.type !== currentCard.type) {
      cardIssues.push({
        field: 'type',
        expected: datasetCard.type,
        actual: currentCard.type
      });
    }
    
    // Check image
    if (datasetCard.image !== currentCard.image) {
      cardIssues.push({
        field: 'image',
        expected: datasetCard.image,
        actual: currentCard.image
      });
    }
    
    // Check stats
    if (!compareStats(datasetCard.stats, currentCard.stats)) {
      cardIssues.push({
        field: 'stats',
        expected: datasetCard.stats,
        actual: currentCard.stats
      });
    }
    
    // Check description (normalize whitespace)
    const datasetDesc = datasetCard.description?.trim() || undefined;
    const currentDesc = currentCard.description?.trim() || undefined;
    if (datasetDesc !== currentDesc) {
      cardIssues.push({
        field: 'description',
        expected: datasetDesc || 'None',
        actual: currentDesc || 'None'
      });
    }
    
    if (cardIssues.length > 0) {
      issues.push({
        cardNumber: datasetCard.cardNumber,
        fullName,
        issues: cardIssues
      });
    } else {
      verified.push({
        cardNumber: datasetCard.cardNumber,
        fullName
      });
    }
  }
  
  // Check for cards in current data that are not in dataset
  const datasetNames = new Set(Array.from(datasetCards.keys()).map(normalizeName));
  const extraCards = currentData.filter(wedge => 
    !datasetNames.has(normalizeName(wedge.fullName))
  );
  
  // Report results
  console.log('✅ Verified cards:', verified.length);
  console.log('❌ Cards with issues:', issues.length);
  console.log('⚠️  Missing cards:', missing.length);
  console.log('➕ Extra cards (in current data but not in dataset):', extraCards.length);
  console.log('\n');
  
  // Separate duplicate issues from card issues
  const duplicateIssues = issues.filter(i => i.type === 'duplicate');
  const cardIssues = issues.filter(i => i.issues && i.issues.length > 0);
  
  if (duplicateIssues.length > 0) {
    console.log('⚠️  DUPLICATE FULLNAMES IN CURRENT DATA:\n');
    const uniqueDuplicates = [...new Set(duplicateIssues.map(i => i.name))];
    uniqueDuplicates.slice(0, 10).forEach((name, idx) => {
      console.log(`${idx + 1}. ${name}`);
    });
    if (uniqueDuplicates.length > 10) {
      console.log(`... and ${uniqueDuplicates.length - 10} more duplicates\n`);
    }
  }
  
  if (cardIssues.length > 0) {
    console.log('\n❌ CARDS WITH DATA MISMATCHES:\n');
    cardIssues.slice(0, 20).forEach((issue, idx) => {
      console.log(`${idx + 1}. Card #${issue.cardNumber}: ${issue.fullName}`);
      issue.issues.forEach(i => {
        if (i.field === 'stats') {
          console.log(`   - ${i.field}:`);
          console.log(`     Expected:`, JSON.stringify(i.expected, null, 2));
          console.log(`     Actual:`, JSON.stringify(i.actual, null, 2));
        } else if (i.field === 'description') {
          console.log(`   - ${i.field}:`);
          console.log(`     Expected: ${i.expected.substring(0, 100)}${i.expected.length > 100 ? '...' : ''}`);
          console.log(`     Actual: ${i.actual.substring(0, 100)}${i.actual.length > 100 ? '...' : ''}`);
        } else {
          console.log(`   - ${i.field}: Expected "${i.expected}", Got "${i.actual}"`);
        }
      });
      console.log('');
    });
    
    if (cardIssues.length > 20) {
      console.log(`... and ${cardIssues.length - 20} more cards with issues\n`);
    }
  }
  
  if (missing.length > 0) {
    console.log('⚠️  MISSING CARDS:\n');
    missing.slice(0, 10).forEach((card, idx) => {
      console.log(`${idx + 1}. Card #${card.cardNumber}: ${card.fullName}`);
    });
    if (missing.length > 10) {
      console.log(`... and ${missing.length - 10} more missing cards\n`);
    }
  }
  
  if (extraCards.length > 0) {
    console.log('➕ EXTRA CARDS (in current data but not in dataset):\n');
    extraCards.slice(0, 10).forEach((card, idx) => {
      console.log(`${idx + 1}. ${card.fullName}`);
    });
    if (extraCards.length > 10) {
      console.log(`... and ${extraCards.length - 10} more extra cards\n`);
    }
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`   Total dataset cards: ${datasetCards.size}`);
  console.log(`   Verified: ${verified.length}`);
  console.log(`   With issues: ${issues.length}`);
  console.log(`   Missing: ${missing.length}`);
  console.log(`   Extra: ${extraCards.length}`);
  
  if (issues.length === 0 && missing.length === 0) {
    console.log('\n✅ All cards verified successfully!');
  } else {
    console.log('\n❌ Verification found issues. Please review above.');
  }
  
  // Write detailed report to file
  const reportPath = path.join(projectRoot, 'verification-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalDatasetCards: datasetCards.size,
      totalCurrentCards: currentData.length,
      verified: verified.length,
      issues: issues.length,
      missing: missing.length,
      extra: extraCards.length
    },
    verified: verified,
    issues: issues,
    missing: missing,
    extra: extraCards.map(c => ({ fullName: c.fullName, id: c.id }))
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

try {
  verifyData();
} catch (error) {
  console.error('❌ Error during verification:', error.message);
  console.error(error.stack);
  process.exit(1);
}

