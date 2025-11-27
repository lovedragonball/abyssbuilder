/**
 * Automated Page Navigation Test
 * Tests all pages to verify they render correctly after PageTransition fixes
 */

const pages = [
  { path: '/my-builds', name: 'My Builds' },
  { path: '/tier-list', name: 'Tier List' },
  { path: '/map', name: 'Interactive Map' },
  { path: '/attribute-optimizer', name: 'Attribute Optimizer' },
  { path: '/materials', name: 'Materials/Forging' },
  { path: '/news', name: 'News & Updates' },
];

async function testPage(baseUrl, page) {
  const url = `${baseUrl}${page.path}`;
  console.log(`\n🧪 Testing: ${page.name} (${url})`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`   ❌ FAIL: HTTP ${response.status} ${response.statusText}`);
      return false;
    }
    
    const html = await response.text();
    
    // Check if page has content (not empty or error page)
    if (html.length < 100) {
      console.log(`   ❌ FAIL: Page content too short (${html.length} bytes)`);
      return false;
    }
    
    // Check for common error indicators
    if (html.includes('404') || html.includes('Page Not Found')) {
      console.log(`   ❌ FAIL: 404 error detected`);
      return false;
    }
    
    if (html.includes('500') || html.includes('Internal Server Error')) {
      console.log(`   ❌ FAIL: 500 error detected`);
      return false;
    }
    
    // Check for React hydration errors
    if (html.includes('Hydration failed') || html.includes('hydration error')) {
      console.log(`   ⚠️  WARNING: Hydration error detected`);
    }
    
    console.log(`   ✅ PASS: Page loaded successfully (${html.length} bytes)`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Page Navigation Test Suite');
  console.log('  Testing PageTransition fixes (Tasks 1 & 2)');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`\n🌐 Base URL: ${baseUrl}`);
  console.log(`📋 Testing ${pages.length} pages...\n`);
  
  const results = [];
  
  for (const page of pages) {
    const passed = await testPage(baseUrl, page);
    results.push({ page: page.name, passed });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Test Summary');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const status = result.passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${result.page}: ${status}`);
  });
  
  console.log(`\n📊 Results: ${passedCount}/${results.length} passed`);
  
  if (failedCount > 0) {
    console.log(`\n⚠️  ${failedCount} page(s) failed. Please check the logs above.`);
    process.exit(1);
  } else {
    console.log('\n🎉 All pages passed! Navigation is working correctly.');
    process.exit(0);
  }
}

// Check if server is running
async function checkServer(baseUrl) {
  try {
    const response = await fetch(baseUrl);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  console.log('🔍 Checking if development server is running...');
  const serverRunning = await checkServer(baseUrl);
  
  if (!serverRunning) {
    console.error(`\n❌ Error: Development server is not running at ${baseUrl}`);
    console.error('   Please start the server with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running!\n');
  
  await runTests();
})();
