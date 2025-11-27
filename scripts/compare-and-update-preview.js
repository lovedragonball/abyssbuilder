const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(__dirname, '..');
const datasetPath = path.join(projectRoot, 'Wedge_Data_Dynamic_Tolerance_2025_Tolerance_update.txt');
const currentDataPath = path.join(projectRoot, 'src', 'lib', 'demon-wedges-data.ts');
const parsedDatasetPath = path.join(projectRoot, 'parsed-dynamic-tolerance-dataset.json');

// Load parsed dataset
const parsedDataset = JSON.parse(fs.readFileSync(parsedDatasetPath, 'utf8'));

// Extract current data
function extractCurrentData(raw) {
  const startToken = 'export const allDemonWedges';
  const startIdx = raw.indexOf(startToken);
  if (startIdx === -1) throw new Error('Unable to locate allDemonWedges export');
  const typeAnnotationEnd = raw.indexOf('=', startIdx);
  if (typeAnnotationEnd === -1) throw new Error('Unable to find = after allDemonWedges');
  const arrayStart = raw.indexOf('[', typeAnnotationEnd);
  if (arrayStart === -1) throw new Error('Unable to find array start');
  
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
  
  const tempFile = path.join(projectRoot, 'temp-demon-wedges-data.js');
  try {
    const jsContent = `module.exports = ${arrayText};`;
    fs.writeFileSync(tempFile, jsContent, 'utf8');
    const resolvedPath = require.resolve(tempFile);
    delete require.cache[resolvedPath];
    const data = require(tempFile);
    delete require.cache[resolvedPath];
    fs.unlinkSync(tempFile);
    return data;
  } catch (err) {
    if (fs.existsSync(tempFile)) {
      try {
        const resolvedPath = require.resolve(tempFile);
        delete require.cache[resolvedPath];
        fs.unlinkSync(tempFile);
      } catch (e) {}
    }
    throw err;
  }
}

function normalizeName(name) {
  return name.trim();
}

function generatePreviewFromDataset(card, datasetCards) {
  const baseName = card.fullName.includes(' - ') 
    ? card.fullName.split(' - ')[0] 
    : card.fullName;
  
  const datasetGroup = parsedDataset.cards[baseName];
  if (!datasetGroup) return undefined;
  
  // Collect all unique images from all variants
  const allImages = new Set();
  
  datasetGroup.forEach(dsCard => {
    if (dsCard.image) allImages.add(dsCard.image);
    if (dsCard.elementIcon) allImages.add(dsCard.elementIcon);
    if (dsCard.trackIcon) allImages.add(dsCard.trackIcon);
  });
  
  // If there are multiple images, create preview array
  if (allImages.size > 1) {
    return Array.from(allImages);
  }
  
  return undefined;
}

function main() {
  console.log('🔍 Comparing Dataset with Current Data...\n');
  
  const currentDataRaw = fs.readFileSync(currentDataPath, 'utf8');
  const currentData = extractCurrentData(currentDataRaw);
  
  console.log(`📊 Current data: ${currentData.length} cards`);
  console.log(`📊 Dataset: ${parsedDataset.summary.totalCards} cards\n`);
  
  // Create maps
  const currentDataMap = new Map();
  currentData.forEach(wedge => {
    const key = normalizeName(wedge.fullName);
    currentDataMap.set(key, wedge);
  });
  
  const datasetCardsMap = new Map();
  Object.values(parsedDataset.cards).flat().forEach(card => {
    const key = normalizeName(card.fullName);
    datasetCardsMap.set(key, card);
  });
  
  // Analysis
  const analysis = {
    missingInCurrent: [],
    missingInDataset: [],
    previewUpdates: [],
    imageMismatches: [],
    typeMismatches: [],
    elementMismatches: [],
    toleranceMismatches: [],
  };
  
  // Check dataset cards
  datasetCardsMap.forEach((datasetCard, fullName) => {
    const currentCard = currentDataMap.get(fullName);
    
    if (!currentCard) {
      analysis.missingInCurrent.push({
        fullName,
        datasetCard,
      });
      return;
    }
    
    // Check preview
    const datasetPreview = generatePreviewFromDataset(currentCard, datasetCardsMap);
    if (datasetPreview && (!currentCard.preview || 
        JSON.stringify(currentCard.preview.sort()) !== JSON.stringify(datasetPreview.sort()))) {
      analysis.previewUpdates.push({
        fullName,
        current: currentCard.preview || [],
        recommended: datasetPreview,
      });
    }
    
    // Check image
    if (datasetCard.image !== currentCard.image) {
      analysis.imageMismatches.push({
        fullName,
        current: currentCard.image,
        dataset: datasetCard.image,
      });
    }
    
    // Check type
    if (datasetCard.type !== currentCard.type) {
      analysis.typeMismatches.push({
        fullName,
        current: currentCard.type,
        dataset: datasetCard.type,
      });
    }
    
    // Check element
    if (datasetCard.element !== currentCard.element) {
      analysis.elementMismatches.push({
        fullName,
        current: currentCard.element || 'None',
        dataset: datasetCard.element || 'None',
      });
    }
    
    // Check tolerance
    if (datasetCard.tolerance !== currentCard.tolerance) {
      analysis.toleranceMismatches.push({
        fullName,
        current: currentCard.tolerance,
        dataset: datasetCard.tolerance,
      });
    }
  });
  
  // Check current cards
  currentDataMap.forEach((currentCard, fullName) => {
    if (!datasetCardsMap.has(fullName)) {
      analysis.missingInDataset.push({
        fullName,
        currentCard,
      });
    }
  });
  
  // Report
  console.log('📊 Analysis Results:\n');
  console.log(`   Missing in Current Data: ${analysis.missingInCurrent.length}`);
  console.log(`   Missing in Dataset: ${analysis.missingInDataset.length}`);
  console.log(`   Preview Updates Needed: ${analysis.previewUpdates.length}`);
  console.log(`   Image Mismatches: ${analysis.imageMismatches.length}`);
  console.log(`   Type Mismatches: ${analysis.typeMismatches.length}`);
  console.log(`   Element Mismatches: ${analysis.elementMismatches.length}`);
  console.log(`   Tolerance Mismatches: ${analysis.toleranceMismatches.length}\n`);
  
  // Show preview updates
  if (analysis.previewUpdates.length > 0) {
    console.log('🖼️  Preview Updates Needed:\n');
    analysis.previewUpdates.slice(0, 20).forEach((update, idx) => {
      console.log(`${idx + 1}. ${update.fullName}`);
      console.log(`   Current: ${update.current.length > 0 ? update.current.join(', ') : 'None'}`);
      console.log(`   Recommended: ${update.recommended.join(', ')}`);
      console.log('');
    });
    if (analysis.previewUpdates.length > 20) {
      console.log(`... and ${analysis.previewUpdates.length - 20} more\n`);
    }
  }
  
  // Show image mismatches
  if (analysis.imageMismatches.length > 0) {
    console.log('🖼️  Image Mismatches:\n');
    analysis.imageMismatches.slice(0, 10).forEach((mismatch, idx) => {
      console.log(`${idx + 1}. ${mismatch.fullName}`);
      console.log(`   Current: ${mismatch.current}`);
      console.log(`   Dataset: ${mismatch.dataset}`);
      console.log('');
    });
    if (analysis.imageMismatches.length > 10) {
      console.log(`... and ${analysis.imageMismatches.length - 10} more\n`);
    }
  }
  
  // Show type mismatches
  if (analysis.typeMismatches.length > 0) {
    console.log('🔷 Type Mismatches:\n');
    analysis.typeMismatches.slice(0, 10).forEach((mismatch, idx) => {
      console.log(`${idx + 1}. ${mismatch.fullName}`);
      console.log(`   Current: ${mismatch.current}`);
      console.log(`   Dataset: ${mismatch.dataset}`);
      console.log('');
    });
    if (analysis.typeMismatches.length > 10) {
      console.log(`... and ${analysis.typeMismatches.length - 10} more\n`);
    }
  }
  
  // Save detailed report
  const reportPath = path.join(projectRoot, 'preview-update-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}`);
}

main();

