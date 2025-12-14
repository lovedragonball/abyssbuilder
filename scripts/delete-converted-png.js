/**
 * Delete PNG files that have been converted to WebP
 * This script finds all WebP files and deletes the corresponding PNG files
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(process.cwd(), 'public');
let deletedCount = 0;
let deletedSize = 0;

function findWebpFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...findWebpFiles(fullPath));
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.webp')) {
            files.push(fullPath);
        }
    }

    return files;
}

function deletePngIfExists(webpPath) {
    const pngPath = webpPath.replace(/\.webp$/i, '.png');

    if (fs.existsSync(pngPath)) {
        const stats = fs.statSync(pngPath);
        const sizeKB = stats.size / 1024;

        try {
            fs.unlinkSync(pngPath);
            deletedCount++;
            deletedSize += stats.size;
            console.log(`🗑️  Deleted: ${path.basename(pngPath)} (${(sizeKB / 1024).toFixed(2)} MB)`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to delete ${pngPath}: ${error.message}`);
            return false;
        }
    }

    return false;
}

function main() {
    console.log('🔍 Finding WebP files and deleting corresponding PNG files...\n');

    const webpFiles = findWebpFiles(PUBLIC_DIR);
    console.log(`Found ${webpFiles.length} WebP files\n`);

    for (const webpFile of webpFiles) {
        deletePngIfExists(webpFile);
    }

    console.log('\n========== SUMMARY ==========');
    console.log(`PNG files deleted: ${deletedCount}`);
    console.log(`Space freed: ${(deletedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('=============================\n');
}

main();
