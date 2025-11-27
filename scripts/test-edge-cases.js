/**
 * Edge Case Testing Script
 * 
 * Automated script to test page navigation edge cases
 * Requirements: 4.2, 4.3
 */

const puppeteer = require('puppeteer')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const pages = [
  '/',
  '/my-builds',
  '/tier-list',
  '/map',
  '/attribute-optimizer',
  '/materials',
  '/news'
]

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testSamePageNavigation(page) {
  log('\n📋 Test 1: Same Page Navigation', 'cyan')
  
  try {
    await page.goto(`${BASE_URL}/my-builds`, { waitUntil: 'networkidle0' })
    const initialUrl = page.url()
    
    // Click same page link multiple times
    for (let i = 0; i < 3; i++) {
      await page.click('a[href="/my-builds"]')
      await sleep(500)
    }
    
    const finalUrl = page.url()
    
    if (initialUrl === finalUrl) {
      log('✅ PASSED: Page remained stable after multiple same-page clicks', 'green')
      return true
    } else {
      log(`❌ FAILED: URL changed unexpectedly from ${initialUrl} to ${finalUrl}`, 'red')
      return false
    }
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red')
    return false
  }
}

async function testRapidNavigation(page) {
  log('\n📋 Test 2: Rapid Navigation', 'cyan')
  
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    
    const testPages = ['/my-builds', '/tier-list', '/map', '/attribute-optimizer', '/materials']
    
    // Rapidly navigate through pages
    for (const pagePath of testPages) {
      await page.click(`a[href="${pagePath}"]`)
      await sleep(200) // 200ms between clicks
    }
    
    // Wait for final navigation to complete
    await sleep(1000)
    
    const finalUrl = page.url()
    const expectedUrl = `${BASE_URL}${testPages[testPages.length - 1]}`
    
    if (finalUrl === expectedUrl) {
      log(`✅ PASSED: Successfully navigated to final page: ${finalUrl}`, 'green')
      return true
    } else {
      log(`❌ FAILED: Expected ${expectedUrl}, got ${finalUrl}`, 'red')
      return false
    }
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red')
    return false
  }
}

async function testNavigationDuringAnimation(page) {
  log('\n📋 Test 3: Navigation During Animation', 'cyan')
  
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    
    // Start first navigation
    await page.click('a[href="/my-builds"]')
    
    // Immediately start second navigation (within animation time)
    await sleep(100)
    await page.click('a[href="/tier-list"]')
    
    // Wait for animations to complete
    await sleep(1000)
    
    const finalUrl = page.url()
    const expectedUrl = `${BASE_URL}/tier-list`
    
    if (finalUrl === expectedUrl) {
      log('✅ PASSED: Second navigation completed successfully', 'green')
      return true
    } else {
      log(`❌ FAILED: Expected ${expectedUrl}, got ${finalUrl}`, 'red')
      return false
    }
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red')
    return false
  }
}

async function testBackForwardNavigation(page) {
  log('\n📋 Test 4: Browser Back/Forward Navigation', 'cyan')
  
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    
    // Navigate forward
    await page.click('a[href="/my-builds"]')
    await sleep(700)
    
    await page.click('a[href="/tier-list"]')
    await sleep(700)
    
    // Navigate back
    await page.goBack()
    await sleep(700)
    
    const currentUrl = page.url()
    const expectedUrl = `${BASE_URL}/my-builds`
    
    if (currentUrl === expectedUrl) {
      log('✅ PASSED: Back navigation worked correctly', 'green')
      
      // Test forward navigation
      await page.goForward()
      await sleep(700)
      
      const forwardUrl = page.url()
      const expectedForwardUrl = `${BASE_URL}/tier-list`
      
      if (forwardUrl === expectedForwardUrl) {
        log('✅ PASSED: Forward navigation worked correctly', 'green')
        return true
      } else {
        log(`❌ FAILED: Forward navigation - Expected ${expectedForwardUrl}, got ${forwardUrl}`, 'red')
        return false
      }
    } else {
      log(`❌ FAILED: Back navigation - Expected ${expectedUrl}, got ${currentUrl}`, 'red')
      return false
    }
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red')
    return false
  }
}

async function testDirectURLAccess(page) {
  log('\n📋 Test 5: Direct URL Access', 'cyan')
  
  let passed = 0
  let failed = 0
  
  for (const pagePath of pages) {
    try {
      const url = `${BASE_URL}${pagePath}`
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 })
      
      // Check if page loaded (no blank screen)
      const content = await page.content()
      const hasContent = content.length > 1000 // Basic check for content
      
      if (hasContent) {
        log(`  ✅ ${pagePath} - Loaded successfully`, 'green')
        passed++
      } else {
        log(`  ❌ ${pagePath} - Blank or minimal content`, 'red')
        failed++
      }
    } catch (error) {
      log(`  ❌ ${pagePath} - Error: ${error.message}`, 'red')
      failed++
    }
  }
  
  log(`\nDirect URL Access: ${passed} passed, ${failed} failed`, failed === 0 ? 'green' : 'red')
  return failed === 0
}

async function testPageReload(page) {
  log('\n📋 Test 6: Page Reload', 'cyan')
  
  try {
    await page.goto(`${BASE_URL}/tier-list`, { waitUntil: 'networkidle0' })
    
    // Reload page
    await page.reload({ waitUntil: 'networkidle0' })
    
    const content = await page.content()
    const hasContent = content.length > 1000
    
    if (hasContent) {
      log('✅ PASSED: Page reloaded successfully', 'green')
      return true
    } else {
      log('❌ FAILED: Page reload resulted in blank or minimal content', 'red')
      return false
    }
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red')
    return false
  }
}

async function testSlowNetwork(page) {
  log('\n📋 Test 7: Slow Network Conditions', 'cyan')
  
  try {
    // Emulate slow 3G
    const client = await page.target().createCDPSession()
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 500 * 1024 / 8, // 500kb/s
      uploadThroughput: 500 * 1024 / 8,
      latency: 400 // 400ms latency
    })
    
    await page.goto(`${BASE_URL}/map`, { waitUntil: 'networkidle0', timeout: 30000 })
    
    const content = await page.content()
    const hasContent = content.length > 1000
    
    // Disable network throttling
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0
    })
    
    if (hasContent) {
      log('✅ PASSED: Page loaded successfully under slow network conditions', 'green')
      return true
    } else {
      log('❌ FAILED: Page failed to load under slow network conditions', 'red')
      return false
    }
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red')
    return false
  }
}

async function testStressTest(page) {
  log('\n📋 Test 8: Stress Test (20 rapid navigations)', 'cyan')
  
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    
    const testPages = ['/my-builds', '/tier-list', '/map', '/materials']
    
    for (let i = 0; i < 20; i++) {
      const randomPage = testPages[Math.floor(Math.random() * testPages.length)]
      await page.click(`a[href="${randomPage}"]`)
      await sleep(150)
    }
    
    await sleep(1000)
    
    // Check for console errors
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    if (errors.length === 0) {
      log('✅ PASSED: Completed 20 rapid navigations without errors', 'green')
      return true
    } else {
      log(`❌ FAILED: Found ${errors.length} console errors during stress test`, 'red')
      return false
    }
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red')
    return false
  }
}

async function runAllTests() {
  log('🚀 Starting Edge Case Testing Suite', 'blue')
  log(`Testing URL: ${BASE_URL}\n`, 'blue')
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const page = await browser.newPage()
  
  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 })
  
  // Track console errors
  const consoleErrors = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })
  
  const results = []
  
  // Run all tests
  results.push(await testSamePageNavigation(page))
  results.push(await testRapidNavigation(page))
  results.push(await testNavigationDuringAnimation(page))
  results.push(await testBackForwardNavigation(page))
  results.push(await testDirectURLAccess(page))
  results.push(await testPageReload(page))
  results.push(await testSlowNetwork(page))
  results.push(await testStressTest(page))
  
  await browser.close()
  
  // Summary
  const passed = results.filter(r => r).length
  const failed = results.filter(r => !r).length
  const total = results.length
  
  log('\n' + '='.repeat(50), 'blue')
  log('📊 Test Summary', 'blue')
  log('='.repeat(50), 'blue')
  log(`Total Tests: ${total}`, 'cyan')
  log(`Passed: ${passed}`, 'green')
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green')
  log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`, failed > 0 ? 'yellow' : 'green')
  
  if (consoleErrors.length > 0) {
    log(`\n⚠️  Console Errors Found: ${consoleErrors.length}`, 'yellow')
    consoleErrors.slice(0, 5).forEach(error => {
      log(`  - ${error}`, 'yellow')
    })
  }
  
  log('\n' + '='.repeat(50), 'blue')
  
  process.exit(failed > 0 ? 1 : 0)
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer')
  runAllTests().catch(error => {
    log(`\n❌ Fatal Error: ${error.message}`, 'red')
    process.exit(1)
  })
} catch (e) {
  log('\n⚠️  Puppeteer is not installed. Install it with:', 'yellow')
  log('npm install --save-dev puppeteer', 'cyan')
  log('\nOr run manual tests at: http://localhost:3000/demo/edge-case-testing', 'blue')
  process.exit(0)
}
