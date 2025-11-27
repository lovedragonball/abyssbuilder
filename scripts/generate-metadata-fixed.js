/**
 * Generate Metadata for DW Image Screenshots (FIXED VERSION with better rate limiting)
 * 
 * อ่านรูปทั้งหมดใน DW Image folder ด้วย Gemini Vision API
 * แล้วสร้าง metadata บอกว่าแต่ละรูปมี mod อะไรบ้าง
 */

const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAjYoAl-au_PeadtbsVcVgmIctCqypPTK0';
const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const DW_IMAGE_DIR = 'DW Image';
const METADATA_FILE = path.join(DW_IMAGE_DIR, 'metadata.json');
const DELAY_BETWEEN_REQUESTS = 6000; // 6 seconds (increased to avoid rate limit)
const MAX_RETRIES = 5; // Increased retries
const INITIAL_RETRY_DELAY = 15000; // 15 seconds initial retry delay

// Helper: Sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Convert image to base64
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

// Helper: Get all PNG files in a directory
function getAllPngFiles(dir, baseDir = dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllPngFiles(fullPath, baseDir));
    } else if (item.toLowerCase().endsWith('.png')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      files.push(relativePath);
    }
  }
  
  return files;
}

// Call Gemini Vision API with retry mechanism and exponential backoff
async function callGeminiWithRetry(apiCall, retryCount = 0) {
  try {
    const response = await apiCall();
    
    // If rate limited (429), retry with exponential backoff
    if (response.status === 429 && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      const jitter = Math.random() * 5000;
      const totalDelay = delay + jitter;
      
      console.log(`  ⚠️  Rate limited (429). Retry ${retryCount + 1}/${MAX_RETRIES} in ${Math.round(totalDelay/1000)}s...`);
      
      await sleep(totalDelay);
      return callGeminiWithRetry(apiCall, retryCount + 1);
    }
    
    return response;
  } catch (error) {
    // Network errors - retry
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`  ⚠️  Network error. Retry ${retryCount + 1}/${MAX_RETRIES} in ${delay/1000}s...`);
      
      await sleep(delay);
      return callGeminiWithRetry(apiCall, retryCount + 1);
    }
    
    throw error;
  }
}

// Call Gemini Vision API to read mods from image
async function readModsFromImage(imagePath) {
  console.log(`  📸 Reading: ${imagePath}`);
  
  try {
    const base64Image = imageToBase64(path.join(DW_IMAGE_DIR, imagePath));
    
    const response = await callGeminiWithRetry(async () => {
      return fetch(
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
                    text: `Read ALL mod names from this game screenshot. List ONLY the mod names, one per line.
Include the complete name with prefix (Phoenix's, Covenanter's, Typhon's, etc.) and variant if present.
If a slot is empty, skip it. Output format: just the mod name, nothing else.

Example output:
Covenanter's Standfast
Phoenix's Nirvana
Typhon's Prime • Uplift
Feathered Serpent's Steadfast

Now read all mod names from this image:`,
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
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`  ❌ API Error:`, error);
      return { mods: [], error: error.error?.message || 'API error' };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse mod names from response
    const mods = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Filter out empty lines and common non-mod text
        if (!line) return false;
        const lower = line.toLowerCase();
        if (lower.includes('here') || lower.includes('following') || lower.includes('slot')) return false;
        if (line.startsWith('#') || line.startsWith('**')) return false;
        if (line.length < 3) return false;
        return /[a-zA-Z]/.test(line);
      })
      .map(line => {
        // Clean up the mod name
        return line
          .replace(/^[-*•]\s*/, '') // Remove bullet points
          .replace(/^\d+\.\s*/, '') // Remove numbering
          .replace(/\s*\+\d+\s*$/, '') // Remove level suffix for consistency
          .trim();
      })
      .filter(line => line.length > 0);

    console.log(`  ✅ Found ${mods.length} mods`);
    return { mods, rawText: text };
    
  } catch (error) {
    console.error(`  ❌ Error:`, error.message);
    return { mods: [], error: error.message };
  }
}

// Main function
async function generateMetadata() {
  console.log('🚀 Starting metadata generation for DW Image screenshots...\n');
  console.log('⚠️  Using slower rate (6s per image) to avoid API limits\n');
  
  // Get all PNG files
  const imageFiles = getAllPngFiles(DW_IMAGE_DIR);
  console.log(`📁 Found ${imageFiles.length} images\n`);
  
  // Load existing metadata if exists
  let metadata = {
    description: "Metadata for all screenshots in DW Image folder - contains mod names found in each image",
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    images: {}
  };
  
  if (fs.existsSync(METADATA_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
      metadata.images = existing.images || {};
      console.log('📂 Loaded existing metadata\n');
    } catch (error) {
      console.log('⚠️  Could not load existing metadata, starting fresh\n');
    }
  }
  
  // Process each image
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const imagePath of imageFiles) {
    // Skip if already processed (unless force flag is set)
    if (metadata.images[imagePath] && metadata.images[imagePath].mods && metadata.images[imagePath].mods.length > 0) {
      console.log(`⏭️  Skipping ${imagePath} (already processed)`);
      skipped++;
      continue;
    }
    
    const result = await readModsFromImage(imagePath);
    
    metadata.images[imagePath] = {
      mods: result.mods,
      processedAt: new Date().toISOString(),
      ...(result.error && { error: result.error }),
      ...(result.rawText && { rawText: result.rawText })
    };
    
    if (result.error) {
      errors++;
    } else {
      processed++;
    }
    
    // Save after each image (in case of interruption)
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
    
    // Delay to avoid rate limiting
    const remaining = imageFiles.length - (processed + skipped + errors);
    if (remaining > 0) {
      console.log(`  ⏳ Waiting ${DELAY_BETWEEN_REQUESTS/1000}s... (${remaining} images remaining)\n`);
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }
  
  // Final save
  metadata.lastUpdated = new Date().toISOString();
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
  
  console.log('\n✅ Metadata generation complete!');
  console.log(`📊 Processed: ${processed} images`);
  console.log(`⏭️  Skipped: ${skipped} images (already processed)`);
  console.log(`❌ Errors: ${errors} images`);
  console.log(`💾 Saved to: ${METADATA_FILE}`);
  
  if (errors > 0) {
    console.log('\n⚠️  Some images had errors. You can run this script again to retry them.');
  }
}

// Run
generateMetadata().catch(console.error);
