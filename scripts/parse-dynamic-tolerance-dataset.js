const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const datasetPath = path.join(projectRoot, 'Wedge_Data_Dynamic_Tolerance_2025_Tolerance_update.txt');
const outputPath = path.join(projectRoot, 'parsed-dynamic-tolerance-dataset.json');

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
    
    const elementLine = block.match(/Element:\s*(.+)/);
    const elementRaw = elementLine ? elementLine[1].trim().toLowerCase() : undefined;
    const element = elementRaw && elementRaw !== 'none' ? ELEMENT_MAP[elementRaw] : undefined;
    
    // Parse Visual Assets
    const mainImage = block.match(/1\. Main Image:\s*(.+)/)?.[1]?.trim() ?? '';
    const elementIcon = block.match(/2\. Element Icon:\s*(.+)/)?.[1]?.trim();
    const trackIcon = block.match(/3\. Track Icon:\s*(.+)/)?.[1]?.trim();
    
    // Determine type from track icon
    let type = 'Normal';
    if (trackIcon && trackIcon !== 'None') {
      const polarityMatch = trackIcon.match(/(\d+)(?=\.webp)/);
      if (polarityMatch) {
        const polarityNumber = Number(polarityMatch[1]);
        type = POLARITY_MAP[polarityNumber] || 'Normal';
      }
    }
    
    // Build preview array
    const preview = [];
    if (mainImage) {
      preview.push(mainImage);
    }
    // Add element icon if different from main image
    if (elementIcon && elementIcon !== 'None' && elementIcon !== mainImage) {
      preview.push(elementIcon);
    }
    // Add track icon if different
    if (trackIcon && trackIcon !== 'None' && trackIcon !== mainImage && !preview.includes(trackIcon)) {
      preview.push(trackIcon);
    }
    
    // Parse Game Data - get all levels
    const dataPart = block.split('[Game Data]')[1];
    const levels = [];
    
    if (dataPart) {
      const levelRegex = /--- (Base Level|Level \+(\d+)) ---([\s\S]*?)(?=(---|=== CARD|$))/g;
      let levelMatch;
      
      while ((levelMatch = levelRegex.exec(dataPart)) !== null) {
        const [, label, levelStr, body] = levelMatch;
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
            if (colonIdx === -1) {
              if (cleaned.startsWith('Effect:')) {
                description = cleaned.replace(/^Effect:\s*/, '').trim();
              }
              return;
            }
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
    }
    
    // Sort levels by level number
    levels.sort((a, b) => a.level - b.level);
    
    const baseName = fullName.includes(' - ') ? fullName.split(' - ')[0] : fullName;
    
    // Get base level data
    const baseLevel = levels.find(l => l.level === 0) || levels[0] || {};
    
    const cardData = {
      cardNumber,
      fullName,
      baseName,
      rarity,
      element,
      image: mainImage,
      elementIcon: elementIcon && elementIcon !== 'None' ? elementIcon : undefined,
      trackIcon: trackIcon && trackIcon !== 'None' ? trackIcon : undefined,
      type,
      preview: preview.length > 1 ? preview : undefined, // Only include if more than main image
      tolerance: baseLevel.tolerance,
      stats: baseLevel.stats || [],
      description: baseLevel.description,
      levels: levels.length > 1 ? levels : undefined, // Only include if multiple levels
    };
    
    // Group by baseName to collect variants
    if (!cards.has(baseName)) {
      cards.set(baseName, []);
    }
    cards.get(baseName).push(cardData);
  }
  
  return cards;
}

function generatePreviewForCardGroup(cards) {
  // Collect all unique images from all variants
  const allImages = new Set();
  
  cards.forEach(card => {
    if (card.image) allImages.add(card.image);
    if (card.elementIcon) allImages.add(card.elementIcon);
    if (card.trackIcon) allImages.add(card.trackIcon);
  });
  
  // If there are multiple images, create preview array
  if (allImages.size > 1) {
    return Array.from(allImages);
  }
  
  return undefined;
}

function main() {
  console.log('🔍 Parsing Dynamic Tolerance Dataset...\n');
  
  const raw = fs.readFileSync(datasetPath, 'utf8');
  const cardsByBaseName = parseDataset(raw);
  
  console.log(`📊 Parsed ${cardsByBaseName.size} unique base names`);
  
  // Count total cards
  let totalCards = 0;
  cardsByBaseName.forEach(cards => {
    totalCards += cards.length;
  });
  console.log(`📊 Total cards: ${totalCards}\n`);
  
  // Analyze preview images
  let cardsWithPreview = 0;
  let cardsWithMultipleVariants = 0;
  let cardsWithTrackIcon = 0;
  let cardsWithElementIcon = 0;
  
  const previewAnalysis = {
    byBaseName: {},
    issues: [],
  };
  
  cardsByBaseName.forEach((cards, baseName) => {
    const preview = generatePreviewForCardGroup(cards);
    
    if (preview && preview.length > 1) {
      cardsWithPreview++;
      previewAnalysis.byBaseName[baseName] = {
        preview,
        variants: cards.length,
        cards: cards.map(c => ({
          fullName: c.fullName,
          element: c.element,
          type: c.type,
          image: c.image,
        })),
      };
    }
    
    if (cards.length > 1) {
      cardsWithMultipleVariants++;
    }
    
    cards.forEach(card => {
      if (card.trackIcon) cardsWithTrackIcon++;
      if (card.elementIcon) cardsWithElementIcon++;
    });
  });
  
  console.log('📊 Preview Analysis:');
  console.log(`   Cards with preview images: ${cardsWithPreview}`);
  console.log(`   Cards with multiple variants: ${cardsWithMultipleVariants}`);
  console.log(`   Cards with Track Icon: ${cardsWithTrackIcon}`);
  console.log(`   Cards with Element Icon: ${cardsWithElementIcon}\n`);
  
  // Check for issues
  console.log('🔍 Checking for issues...\n');
  
  cardsByBaseName.forEach((cards, baseName) => {
    // Check if all cards in group have same main image
    const mainImages = new Set(cards.map(c => c.image));
    if (mainImages.size > 1) {
      previewAnalysis.issues.push({
        type: 'multiple_main_images',
        baseName,
        images: Array.from(mainImages),
        cards: cards.map(c => ({ fullName: c.fullName, image: c.image })),
      });
    }
    
    // Check for missing preview when there are variants
    if (cards.length > 1) {
      const preview = generatePreviewForCardGroup(cards);
      if (!preview || preview.length <= 1) {
        previewAnalysis.issues.push({
          type: 'missing_preview',
          baseName,
          variants: cards.length,
          cards: cards.map(c => ({ fullName: c.fullName, element: c.element, image: c.image })),
        });
      }
    }
  });
  
  if (previewAnalysis.issues.length > 0) {
    console.log(`⚠️  Found ${previewAnalysis.issues.length} issues:\n`);
    previewAnalysis.issues.slice(0, 10).forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue.type}: ${issue.baseName}`);
      if (issue.images) {
        console.log(`   Images: ${issue.images.join(', ')}`);
      }
      if (issue.variants) {
        console.log(`   Variants: ${issue.variants}`);
      }
      console.log('');
    });
    if (previewAnalysis.issues.length > 10) {
      console.log(`... and ${previewAnalysis.issues.length - 10} more issues\n`);
    }
  } else {
    console.log('✅ No issues found!\n');
  }
  
  // Save results
  const output = {
    summary: {
      totalBaseNames: cardsByBaseName.size,
      totalCards,
      cardsWithPreview,
      cardsWithMultipleVariants,
      cardsWithTrackIcon,
      cardsWithElementIcon,
      issues: previewAnalysis.issues.length,
    },
    previewAnalysis,
    cards: Object.fromEntries(cardsByBaseName),
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`📄 Results saved to: ${outputPath}`);
  
  // Generate preview recommendations
  console.log('\n📋 Preview Recommendations:\n');
  const recommendations = [];
  
  Object.entries(previewAnalysis.byBaseName).slice(0, 20).forEach(([baseName, data]) => {
    recommendations.push({
      baseName,
      preview: data.preview,
      note: `Has ${data.variants} variants`,
    });
  });
  
  recommendations.forEach((rec, idx) => {
    console.log(`${idx + 1}. ${rec.baseName}`);
    console.log(`   Preview: ${rec.preview.join(', ')}`);
    console.log(`   Note: ${rec.note}`);
    console.log('');
  });
}

main();

