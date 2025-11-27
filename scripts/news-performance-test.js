/**
 * Performance Testing Script for News Updates Section
 * Measures load times, animation performance, and rendering metrics
 */

const puppeteer = require('puppeteer');

async function measurePerformance() {
  console.log('⚡ Starting Performance Tests for News Updates Section\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = {
    loadTime: {},
    animations: {},
    scrolling: {},
    memory: {},
  };

  try {
    // Test 1: Initial Load Performance
    console.log('📊 Test 1: Initial Load Performance');
    console.log('─'.repeat(50));

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Enable performance metrics
    await page.evaluateOnNewDocument(() => {
      window.performanceMetrics = [];
    });

    const startTime = Date.now();
    await page.goto('http://localhost:3000/demo/news-updates-section', {
      waitUntil: 'networkidle0',
    });

    const loadTime = Date.now() - startTime;
    results.loadTime.total = loadTime;

    // Get performance metrics
    const metrics = await page.metrics();
    results.loadTime.metrics = metrics;

    // Get Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // First Contentful Paint
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
          vitals.FCP = fcpEntry.startTime;
        }

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.LCP = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        let clsScore = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          }
          vitals.CLS = clsScore;
        }).observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => resolve(vitals), 2000);
      });
    });

    results.loadTime.webVitals = webVitals;

    console.log(`  Total Load Time: ${loadTime}ms`);
    console.log(`  FCP: ${webVitals.FCP?.toFixed(2)}ms`);
    console.log(`  LCP: ${webVitals.LCP?.toFixed(2)}ms`);
    console.log(`  CLS: ${webVitals.CLS?.toFixed(4)}`);

    // Check against requirements
    const loadTimePassed = loadTime < 2000;
    console.log(`  ${loadTimePassed ? '✅' : '❌'} Load time requirement (<2s): ${loadTimePassed ? 'PASSED' : 'FAILED'}`);

    // Test 2: Animation Performance
    console.log('\n📊 Test 2: Animation Performance');
    console.log('─'.repeat(50));

    const animationMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics = {
          frameDrops: 0,
          averageFPS: 0,
          frames: [],
        };

        let lastTime = performance.now();
        let frameCount = 0;
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        function measureFrame() {
          const currentTime = performance.now();
          const delta = currentTime - lastTime;
          const fps = 1000 / delta;
          
          metrics.frames.push(fps);
          if (fps < 50) metrics.frameDrops++;
          
          frameCount++;
          lastTime = currentTime;

          if (currentTime - startTime < duration) {
            requestAnimationFrame(measureFrame);
          } else {
            metrics.averageFPS = metrics.frames.reduce((a, b) => a + b, 0) / metrics.frames.length;
            resolve(metrics);
          }
        }

        // Trigger some animations
        const cards = document.querySelectorAll('[class*="card"]');
        cards.forEach(card => {
          card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        });

        requestAnimationFrame(measureFrame);
      });
    });

    results.animations = animationMetrics;

    console.log(`  Average FPS: ${animationMetrics.averageFPS.toFixed(2)}`);
    console.log(`  Frame Drops: ${animationMetrics.frameDrops}`);
    
    const fpsPassed = animationMetrics.averageFPS >= 55;
    console.log(`  ${fpsPassed ? '✅' : '❌'} FPS requirement (≥55): ${fpsPassed ? 'PASSED' : 'FAILED'}`);

    // Test 3: Scrolling Performance
    console.log('\n📊 Test 3: Scrolling Performance');
    console.log('─'.repeat(50));

    // Load page with many items
    await page.goto('http://localhost:3000/demo/news-updates-section?items=25', {
      waitUntil: 'networkidle0',
    });

    const scrollMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const scrollContainer = document.querySelector('[style*="overflow"]');
        if (!scrollContainer) {
          resolve({ error: 'No scrollable container found' });
          return;
        }

        const metrics = {
          frameDrops: 0,
          averageFPS: 0,
          frames: [],
          scrollHeight: scrollContainer.scrollHeight,
          clientHeight: scrollContainer.clientHeight,
        };

        let lastTime = performance.now();
        let scrolling = true;

        function measureScrollFrame() {
          const currentTime = performance.now();
          const delta = currentTime - lastTime;
          const fps = 1000 / delta;
          
          metrics.frames.push(fps);
          if (fps < 50) metrics.frameDrops++;
          
          lastTime = currentTime;

          if (scrolling) {
            requestAnimationFrame(measureScrollFrame);
          } else {
            metrics.averageFPS = metrics.frames.reduce((a, b) => a + b, 0) / metrics.frames.length;
            resolve(metrics);
          }
        }

        // Start measuring
        requestAnimationFrame(measureScrollFrame);

        // Perform smooth scroll
        let scrollPos = 0;
        const scrollInterval = setInterval(() => {
          scrollPos += 10;
          scrollContainer.scrollTop = scrollPos;
          
          if (scrollPos >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
            clearInterval(scrollInterval);
            scrolling = false;
          }
        }, 16); // ~60fps
      });
    });

    results.scrolling = scrollMetrics;

    if (scrollMetrics.error) {
      console.log(`  ⚠️  ${scrollMetrics.error}`);
    } else {
      console.log(`  Average FPS during scroll: ${scrollMetrics.averageFPS.toFixed(2)}`);
      console.log(`  Frame Drops: ${scrollMetrics.frameDrops}`);
      console.log(`  Scroll Height: ${scrollMetrics.scrollHeight}px`);
      
      const scrollFPSPassed = scrollMetrics.averageFPS >= 55;
      console.log(`  ${scrollFPSPassed ? '✅' : '❌'} Scroll FPS requirement (≥55): ${scrollFPSPassed ? 'PASSED' : 'FAILED'}`);
    }

    // Test 4: Memory Usage
    console.log('\n📊 Test 4: Memory Usage');
    console.log('─'.repeat(50));

    const memoryMetrics = await page.metrics();
    results.memory = {
      jsHeapUsedSize: memoryMetrics.JSHeapUsedSize,
      jsHeapTotalSize: memoryMetrics.JSHeapTotalSize,
      usagePercentage: (memoryMetrics.JSHeapUsedSize / memoryMetrics.JSHeapTotalSize) * 100,
    };

    console.log(`  JS Heap Used: ${(memoryMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  JS Heap Total: ${(memoryMetrics.JSHeapTotalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Usage: ${results.memory.usagePercentage.toFixed(2)}%`);

    // Test 5: Render Performance with Different Content Sizes
    console.log('\n📊 Test 5: Render Performance (Content Variations)');
    console.log('─'.repeat(50));

    const contentTests = [
      { name: 'Few Items (2)', items: 2 },
      { name: 'Medium Items (10)', items: 10 },
      { name: 'Many Items (25)', items: 25 },
    ];

    results.contentVariations = [];

    for (const test of contentTests) {
      const startRender = Date.now();
      await page.goto(`http://localhost:3000/demo/news-updates-section?items=${test.items}`, {
        waitUntil: 'networkidle0',
      });
      const renderTime = Date.now() - startRender;

      results.contentVariations.push({
        name: test.name,
        items: test.items,
        renderTime,
      });

      console.log(`  ${test.name}: ${renderTime}ms`);
    }

    await page.close();

  } catch (error) {
    console.error('\n❌ Performance test error:', error);
  } finally {
    await browser.close();
  }

  // Print Summary
  console.log('\n\n📊 Performance Summary');
  console.log('═'.repeat(50));

  const allPassed = 
    results.loadTime.total < 2000 &&
    results.animations.averageFPS >= 55 &&
    (!results.scrolling.error && results.scrolling.averageFPS >= 55);

  console.log(`\nOverall Status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('\nKey Metrics:');
  console.log(`  Load Time: ${results.loadTime.total}ms (requirement: <2000ms)`);
  console.log(`  Animation FPS: ${results.animations.averageFPS.toFixed(2)} (requirement: ≥55)`);
  if (!results.scrolling.error) {
    console.log(`  Scroll FPS: ${results.scrolling.averageFPS.toFixed(2)} (requirement: ≥55)`);
  }
  console.log(`  Memory Usage: ${results.memory.usagePercentage.toFixed(2)}%`);

  // Save results
  const fs = require('fs');
  const path = require('path');
  const resultsPath = path.join(process.cwd(), 'test-results', 'news-performance.json');
  
  if (!fs.existsSync(path.dirname(resultsPath))) {
    fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  }
  
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed results saved to: ${resultsPath}`);

  process.exit(allPassed ? 0 : 1);
}

// Run tests
if (require.main === module) {
  measurePerformance().catch(console.error);
}

module.exports = { measurePerformance };
