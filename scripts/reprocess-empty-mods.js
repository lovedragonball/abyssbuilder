/**
 * Re-process images with 0 mods
 * ตรวจสอบรูปที่ไม่พบ mod แล้วประมวลผลใหม่
 */

const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAjYoAl-au_PeadtbsVcVgmIctCqypPTK0';
const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const DW_IMAGE_DIR = 'DW Image';
const METADATA_FILE = path.join(DW_IMAGE_DIR, 'metadata.json');
const DELAY_BETWEEN_REQUESTS = 6000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

async function reprocessImage(imagePath, rawText) {
  console.log(`\n📸 Re-processing: ${imagePath}`);
  console.log(`   Raw text from previous attempt:`);
  console.log(`   "${rawText}"`);
  
  try {
    const base64Image = imageToBase64(path.join(DW_IMAGE_DIR, imagePath));
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Read ALL mod names from this game screenshot. 

IMPORTANT: List EVERY mod name you see, including:
- Feathered Serpent's mods (Prime, Recovery, Cutoff, Unyielding, Vigilant, Rescue, Steadfast, etc.)
- Even if the same mod appears multiple times, list each one
- Include the complete name with prefix

Output format: One mod name per line, nothing else.

Example:
Feathered Serpent's Prime
Feathered Serpent's Prime
Feathered Serpent's Recovery
Covenanter's Standfast

Now read ALL mod names:`,
                },
                {
                  inline_data: {
                    mime_type: 'image/png',
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 20,
            topP: 0.95,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error(`  ❌ API Error:`, error);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log(`\n   New response:`);
    console.log(`   "${text}"`);
    
    // Parse with LESS strict filtering
    const mods = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        if (!line) return false;
        const lower = line.toLowerCase();
        // Only filter out obvious non-mod text
        if (lower.includes('here are') || lower.includes('following') || lower.startsWith('slot ')) return false;
        if (line.startsWith('#') || line.startsWith('**') || line.startsWith('```')) return false;
        if (line.length < 3) return false;
        // Must have letters
        return /[a-zA-Z]/.test(line);
      })
      .map(line => {
        // Clean up
        return line
          .replace(/^[-*•]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim();
      })
      .filter(line => line.length > 0);

    console.log(`\n   ✅ Parsed ${mods.length} mods:`);
    mods.forEach(mod => console.log(`      - ${mod}`));
    
    return { mods, rawText: text };
    
  } catch (error) {
    console.error(`  ❌ Error:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Finding images with 0 mods...\n');
  
  // Load metadata
  const metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
  
  // Find images with 0 mods
  const emptyImages = [];
  for (const [imagePath, imageData] of Object.entries(metadata.images)) {
    if (imageData.mods && imageData.mods.length === 0) {
      emptyImages.push({ path: imagePath, rawText: imageData.rawText || '' });
    }
  }
  
  console.log(`📊 Found ${emptyImages.length} images with 0 mods:\n`);
  emptyImages.forEach(img => console.log(`   - ${img.path}`));
  
  if (emptyImages.length === 0) {
    console.log('\n✅ No images with 0 mods found!');
    return;
  }
  
  console.log('\n🚀 Re-processing these images...\n');
  
  let processed = 0;
  let fixed = 0;
  
  for (const img of emptyImages) {
    const result = await reprocessImage(img.path, img.rawText);
    
    if (result && result.mods.length > 0) {
      // Update metadata
      metadata.images[img.path] = {
        ...metadata.images[img.path],
        mods: result.mods,
        rawText: result.rawText,
        reprocessedAt: new Date().toISOString(),
      };
      
      // Save immediately
      fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
      
      console.log(`   ✅ Fixed! Now has ${result.mods.length} mods`);
      fixed++;
    } else {
      console.log(`   ⚠️  Still 0 mods (might be empty screenshot)`);
    }
    
    processed++;
    
    // Delay
    if (processed < emptyImages.length) {
      console.log(`\n   ⏳ Waiting ${DELAY_BETWEEN_REQUESTS/1000}s...\n`);
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }
  
  console.log('\n✅ Re-processing complete!');
  console.log(`📊 Processed: ${processed} images`);
  console.log(`🔧 Fixed: ${fixed} images`);
  console.log(`💾 Saved to: ${METADATA_FILE}`);
}

main().catch(console.error);
