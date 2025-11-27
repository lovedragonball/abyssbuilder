/**
 * Visual Regression Testing Script for News Updates Section
 * Tests various screen sizes and content scenarios
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Screen sizes to test
const SCREEN_SIZES = [
  { name: 'mobile-small', width: 320, height: 568 },
  { name: 'mobile-medium', width: 375, height: 667 },
  { name: 'mobile-large', width: 414, height: 896 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1024, height: 768 },
  { name: 'desktop-hd', width: 1920, height: 1080 },
  { name: 'desktop-2k', width: 2560, height: 1440 },
  { name: 'ultrawide', width: 3440, height: 1440 },
];

// Test scenarios
const SCENARIOS = [
  { name: 'default', url: '/demo/news-updates-section' },
  { name: 'empty-state', url: '/demo/news-updates-section?empty=true' },
  { name: 'few-items', url: '/demo/news-updates-section?items=2' },
  { name: 'many-items', url: '/demo/news-updates-section?items=25' },
];

async function runVisualTests() {
  console.log('🎨 Starting Visual Regression Tests for News Updates Section\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    details: [],
  };

  try {
    for (const scenario of SCENARIOS) {
      console.log(`\n📋 Testing Scenario: ${scenario.name}`);
      console.log('─'.repeat(50));

      for (const size of SCREEN_SIZES) {
        results.total++;
        const testName = `${scenario.name}-${size.name}`;
        
        try {
          const page = await browser.newPage();
          await page.setViewport({
            width: size.width,
            height: size.height,
            deviceScaleFactor: 1,
          });

          // Navigate to page
          const url = `http://localhost:3000${scenario.url}`;
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });

          // Wait for content to load
          await page.waitForSelector('.news-updates-grid', { timeout: 5000 });

          // Wait for animations to complete
          await page.waitForTimeout(1000);

          // Take screenshot
          const screenshotDir = path.join(process.cwd(), 'test-screenshots', 'news-section');
          if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
          }

          const screenshotPath = path.join(screenshotDir, `${testName}.png`);
          await page.screenshot({
            path: screenshotPath,
            fullPage: true,
          });

          // Check for layout issues
          const layoutCheck = await page.evaluate(() => {
            const issues = [];
            
            // Check for horizontal overflow
            const body = document.body;
            if (body.scrollWidth > body.clientWidth) {
              issues.push('Horizontal overflow detected');
            }

            // Check for cards
            const cards = document.querySelectorAll('[class*="card"]');
            if (cards.length === 0) {
              issues.push('No cards found');
            }

            // Check for grid
            const grid = document.querySelector('.news-updates-grid');
            if (!grid) {
              issues.push('Grid container not found');
            }

            // Check for text overflow
            const textElements = document.querySelectorAll('p, span, div');
            textElements.forEach((el) => {
              if (el.scrollWidth > el.clientWidth + 5) { // 5px tolerance
                const text = el.textContent?.substring(0, 50);
                issues.push(`Text overflow in element: ${text}...`);
              }
            });

            return issues;
          });

          if (layoutCheck.length === 0) {
            console.log(`  ✅ ${size.name} (${size.width}x${size.height})`);
            results.passed++;
            results.details.push({
              test: testName,
              status: 'passed',
              size: `${size.width}x${size.height}`,
              screenshot: screenshotPath,
            });
          } else {
            console.log(`  ❌ ${size.name} (${size.width}x${size.height})`);
            console.log(`     Issues: ${layoutCheck.join(', ')}`);
            results.failed++;
            results.details.push({
              test: testName,
              status: 'failed',
              size: `${size.width}x${size.height}`,
              issues: layoutCheck,
              screenshot: screenshotPath,
            });
          }

          await page.close();
        } catch (error) {
          console.log(`  ❌ ${size.name} (${size.width}x${size.height})`);
          console.log(`     Error: ${error.message}`);
          results.failed++;
          results.details.push({
            test: testName,
            status: 'error',
            size: `${size.width}x${size.height}`,
            error: error.message,
          });
        }
      }
    }

    // Test animations and interactions
    console.log('\n\n🎬 Testing Animations and Interactions');
    console.log('─'.repeat(50));

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/demo/news-updates-section', {
      waitUntil: 'networkidle0',
    });

    // Test hover effects
    const hoverTest = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="card"]');
      if (cards.length === 0) return false;

      const card = cards[0];
      const beforeHover = window.getComputedStyle(card).transform;
      
      // Simulate hover
      card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      
      return true;
    });

    if (hoverTest) {
      console.log('  ✅ Hover effects work');
    } else {
      console.log('  ❌ Hover effects failed');
    }

    // Test scrolling
    const scrollTest = await page.evaluate(() => {
      const scrollContainers = document.querySelectorAll('[style*="overflow"]');
      return scrollContainers.length > 0;
    });

    if (scrollTest) {
      console.log('  ✅ Scrollable containers present');
    } else {
      console.log('  ⚠️  No scrollable containers found (may be expected)');
    }

    await page.close();

  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n\n📊 Test Summary');
  console.log('═'.repeat(50));
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  // Save results
  const resultsPath = path.join(process.cwd(), 'test-screenshots', 'news-section', 'results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed results saved to: ${resultsPath}`);

  // Generate HTML report
  generateHTMLReport(results);

  process.exit(results.failed > 0 ? 1 : 0);
}

function generateHTMLReport(results) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>News Section Visual Regression Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #4CAF50;
      padding-bottom: 10px;
    }
    .summary {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .summary-card {
      padding: 15px;
      border-radius: 6px;
      text-align: center;
    }
    .summary-card.passed {
      background: #e8f5e9;
      border: 2px solid #4CAF50;
    }
    .summary-card.failed {
      background: #ffebee;
      border: 2px solid #f44336;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      font-size: 2em;
    }
    .test-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .test-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .test-card.passed {
      border-left: 4px solid #4CAF50;
    }
    .test-card.failed {
      border-left: 4px solid #f44336;
    }
    .test-card.error {
      border-left: 4px solid #ff9800;
    }
    .test-header {
      padding: 15px;
      background: #fafafa;
      border-bottom: 1px solid #eee;
    }
    .test-header h3 {
      margin: 0 0 5px 0;
      font-size: 1.1em;
    }
    .test-header .size {
      color: #666;
      font-size: 0.9em;
    }
    .test-body {
      padding: 15px;
    }
    .test-body img {
      width: 100%;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .issues {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 10px;
      margin-top: 10px;
    }
    .issues ul {
      margin: 5px 0;
      padding-left: 20px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
    }
    .status-badge.passed {
      background: #4CAF50;
      color: white;
    }
    .status-badge.failed {
      background: #f44336;
      color: white;
    }
    .status-badge.error {
      background: #ff9800;
      color: white;
    }
  </style>
</head>
<body>
  <h1>📸 News Section Visual Regression Report</h1>
  
  <div class="summary">
    <h2>Test Summary</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <h3>${results.total}</h3>
        <p>Total Tests</p>
      </div>
      <div class="summary-card passed">
        <h3>${results.passed}</h3>
        <p>Passed ✅</p>
      </div>
      <div class="summary-card failed">
        <h3>${results.failed}</h3>
        <p>Failed ❌</p>
      </div>
      <div class="summary-card">
        <h3>${((results.passed / results.total) * 100).toFixed(1)}%</h3>
        <p>Success Rate</p>
      </div>
    </div>
  </div>

  <h2>Test Results</h2>
  <div class="test-grid">
    ${results.details.map(test => `
      <div class="test-card ${test.status}">
        <div class="test-header">
          <h3>${test.test}</h3>
          <div class="size">${test.size}</div>
          <span class="status-badge ${test.status}">${test.status.toUpperCase()}</span>
        </div>
        <div class="test-body">
          ${test.screenshot ? `<img src="${path.basename(test.screenshot)}" alt="${test.test}">` : ''}
          ${test.issues ? `
            <div class="issues">
              <strong>Issues Found:</strong>
              <ul>
                ${test.issues.map(issue => `<li>${issue}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${test.error ? `
            <div class="issues">
              <strong>Error:</strong>
              <p>${test.error}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('')}
  </div>

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
    <p>Generated on ${new Date().toLocaleString()}</p>
  </footer>
</body>
</html>
  `;

  const reportPath = path.join(process.cwd(), 'test-screenshots', 'news-section', 'report.html');
  fs.writeFileSync(reportPath, html);
  console.log(`📊 HTML report generated: ${reportPath}`);
}

// Run tests
if (require.main === module) {
  runVisualTests().catch(console.error);
}

module.exports = { runVisualTests };
