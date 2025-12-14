/**
 * PNG to WebP Converter Script
 * Converts all PNG files in the public folder to WebP format
 * Run with: node scripts/convert-to-webp.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try to use sharp if available, otherwise provide instructions
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.log('Sharp is not installed. Installing...');
    try {
        execSync('npm install sharp --save-dev', { stdio: 'inherit' });
        sharp = require('sharp');
    } catch (installError) {
        console.error('Failed to install sharp. Please run: npm install sharp --save-dev');
        console.log('\nAlternatively, you can use online tools like:');
        console.log('- https://squoosh.app/');
        console.log('- https://cloudconvert.com/png-to-webp');
        process.exit(1);
    }
}

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const QUALITY = 80; // WebP quality (0-100)
const MIN_SIZE_KB = 1; // Convert all files larger than 1KB

let totalSaved = 0;
let filesConverted = 0;
let filesSkipped = 0;

async function findPngFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...await findPngFiles(fullPath));
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
            files.push(fullPath);
        }
    }

    return files;
}

async function convertToWebp(pngPath) {
    const stats = fs.statSync(pngPath);
    const sizeKB = stats.size / 1024;

    if (sizeKB < MIN_SIZE_KB) {
        filesSkipped++;
        return { skipped: true, reason: 'too small' };
    }

    const webpPath = pngPath.replace(/\.png$/i, '.webp');

    try {
        await sharp(pngPath)
            .webp({ quality: QUALITY })
            .toFile(webpPath);

        const webpStats = fs.statSync(webpPath);
        const savedBytes = stats.size - webpStats.size;
        const savedPercent = ((savedBytes / stats.size) * 100).toFixed(1);

        if (savedBytes > 0) {
            totalSaved += savedBytes;
            filesConverted++;

            console.log(`✅ ${path.basename(pngPath)}`);
            console.log(`   ${(stats.size / 1024 / 1024).toFixed(2)} MB -> ${(webpStats.size / 1024 / 1024).toFixed(2)} MB (saved ${savedPercent}%)`);

            return { success: true, savedBytes };
        } else {
            // WebP is larger, remove it
            fs.unlinkSync(webpPath);
            filesSkipped++;
            return { skipped: true, reason: 'webp larger' };
        }
    } catch (error) {
        console.error(`❌ Failed to convert ${pngPath}: ${error.message}`);
        return { error: true };
    }
}

async function main() {
    console.log('🔍 Searching for PNG files in public folder...\n');

    const pngFiles = await findPngFiles(PUBLIC_DIR);
    console.log(`Found ${pngFiles.length} PNG files\n`);

    if (pngFiles.length === 0) {
        console.log('No PNG files found.');
        return;
    }

    // Sort by size (largest first)
    pngFiles.sort((a, b) => {
        return fs.statSync(b).size - fs.statSync(a).size;
    });

    console.log('Converting PNG files to WebP (largest first)...\n');

    for (const pngFile of pngFiles) {
        await convertToWebp(pngFile);
    }

    console.log('\n========== SUMMARY ==========');
    console.log(`Files converted: ${filesConverted}`);
    console.log(`Files skipped: ${filesSkipped}`);
    console.log(`Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
    console.log('=============================\n');

    if (filesConverted > 0) {
        console.log('⚠️  Remember to:');
        console.log('1. Update image references in your code to use .webp instead of .png');
        console.log('2. Consider keeping original PNG files as backup');
        console.log('3. Test that all images load correctly');
    }
}

main().catch(console.error);
