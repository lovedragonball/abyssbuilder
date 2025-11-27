/**
 * Verification script for News & Updates integration
 * Tests that the news section is properly integrated on homepage and standalone page
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying News & Updates Integration...\n');

let allTestsPassed = true;

// Test 1: Check if getPatchData function exists in patch-data-server.ts
console.log('Test 1: Checking getPatchData function...');
const serverFilePath = path.join(process.cwd(), 'src/lib/patch-data-server.ts');
if (fs.existsSync(serverFilePath)) {
  const serverContent = fs.readFileSync(serverFilePath, 'utf-8');
  if (serverContent.includes('export async function getPatchData')) {
    console.log('✅ getPatchData function exists in patch-data-server.ts\n');
  } else {
    console.log('❌ getPatchData function not found in patch-data-server.ts\n');
    allTestsPassed = false;
  }
} else {
  console.log('❌ patch-data-server.ts file not found\n');
  allTestsPassed = false;
}

// Test 2: Check if homepage imports and uses NewsUpdatesSection
console.log('Test 2: Checking homepage integration...');
const homePagePath = path.join(process.cwd(), 'src/app/page.tsx');
if (fs.existsSync(homePagePath)) {
  const homeContent = fs.readFileSync(homePagePath, 'utf-8');
  const hasImport = homeContent.includes("import { NewsUpdatesSection }");
  const hasGetPatchData = homeContent.includes("import { getPatchData }");
  const hasUsage = homeContent.includes("<NewsUpdatesSection");
  const hasServerComponent = !homeContent.includes("'use client'");
  
  if (hasImport && hasGetPatchData && hasUsage && hasServerComponent) {
    console.log('✅ Homepage properly integrates NewsUpdatesSection');
    console.log('   - Imports NewsUpdatesSection component');
    console.log('   - Imports getPatchData function');
    console.log('   - Uses NewsUpdatesSection in JSX');
    console.log('   - Is a server component\n');
  } else {
    console.log('❌ Homepage integration incomplete:');
    if (!hasImport) console.log('   - Missing NewsUpdatesSection import');
    if (!hasGetPatchData) console.log('   - Missing getPatchData import');
    if (!hasUsage) console.log('   - Missing NewsUpdatesSection usage');
    if (!hasServerComponent) console.log('   - Should be a server component (remove "use client")');
    console.log('');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Homepage file not found\n');
  allTestsPassed = false;
}

// Test 3: Check if standalone news page exists
console.log('Test 3: Checking standalone news page...');
const newsPagePath = path.join(process.cwd(), 'src/app/news/page.tsx');
if (fs.existsSync(newsPagePath)) {
  const newsContent = fs.readFileSync(newsPagePath, 'utf-8');
  const hasImport = newsContent.includes("import { NewsUpdatesSection }");
  const hasGetPatchData = newsContent.includes("import { getPatchData }");
  const hasUsage = newsContent.includes("<NewsUpdatesSection");
  const hasMetadata = newsContent.includes("export const metadata");
  const hasTitle = newsContent.includes("News & Updates");
  
  if (hasImport && hasGetPatchData && hasUsage && hasMetadata && hasTitle) {
    console.log('✅ Standalone news page properly configured');
    console.log('   - Imports NewsUpdatesSection component');
    console.log('   - Imports getPatchData function');
    console.log('   - Uses NewsUpdatesSection in JSX');
    console.log('   - Has metadata export');
    console.log('   - Has proper page title\n');
  } else {
    console.log('❌ News page configuration incomplete:');
    if (!hasImport) console.log('   - Missing NewsUpdatesSection import');
    if (!hasGetPatchData) console.log('   - Missing getPatchData import');
    if (!hasUsage) console.log('   - Missing NewsUpdatesSection usage');
    if (!hasMetadata) console.log('   - Missing metadata export');
    if (!hasTitle) console.log('   - Missing page title');
    console.log('');
    allTestsPassed = false;
  }
} else {
  console.log('❌ News page file not found\n');
  allTestsPassed = false;
}

// Test 4: Check if navigation link exists in header
console.log('Test 4: Checking navigation link...');
const headerPath = path.join(process.cwd(), 'src/components/layout/header.tsx');
if (fs.existsSync(headerPath)) {
  const headerContent = fs.readFileSync(headerPath, 'utf-8');
  const hasNewsLink = headerContent.includes("/news") && 
                      (headerContent.includes("News & Updates") || headerContent.includes("News"));
  
  if (hasNewsLink) {
    console.log('✅ Navigation link to news page exists in header\n');
  } else {
    console.log('❌ Navigation link to news page not found in header\n');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Header file not found\n');
  allTestsPassed = false;
}

// Test 5: Check if patch-parser.ts doesn't import fs (client-safe)
console.log('Test 5: Checking patch-parser.ts is client-safe...');
const parserPath = path.join(process.cwd(), 'src/lib/patch-parser.ts');
if (fs.existsSync(parserPath)) {
  const parserContent = fs.readFileSync(parserPath, 'utf-8');
  const hasFs = parserContent.includes("import fs") || parserContent.includes("require('fs')");
  
  if (!hasFs) {
    console.log('✅ patch-parser.ts is client-safe (no fs imports)\n');
  } else {
    console.log('❌ patch-parser.ts imports fs (should be in patch-data-server.ts only)\n');
    allTestsPassed = false;
  }
} else {
  console.log('❌ patch-parser.ts file not found\n');
  allTestsPassed = false;
}

// Test 6: Check if Patch.txt file exists
console.log('Test 6: Checking Patch.txt file...');
const patchFilePath = path.join(process.cwd(), 'Patch.txt');
if (fs.existsSync(patchFilePath)) {
  const stats = fs.statSync(patchFilePath);
  console.log(`✅ Patch.txt file exists (${(stats.size / 1024).toFixed(2)} KB)\n`);
} else {
  console.log('❌ Patch.txt file not found\n');
  allTestsPassed = false;
}

// Summary
console.log('═══════════════════════════════════════════════════════');
if (allTestsPassed) {
  console.log('✅ All integration tests passed!');
  console.log('\nNext steps:');
  console.log('1. Start the dev server: npm run dev');
  console.log('2. Visit http://localhost:3000 to see the news section on homepage');
  console.log('3. Visit http://localhost:3000/news to see the standalone news page');
  console.log('4. Click "News & Updates" in the navigation menu');
} else {
  console.log('❌ Some integration tests failed. Please review the errors above.');
  process.exit(1);
}
console.log('═══════════════════════════════════════════════════════');
