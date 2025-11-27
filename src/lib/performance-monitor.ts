/**
 * Performance Monitoring Utilities
 * For measuring animation frame rate and page load times
 * Requirements: 4.1, 4.2, 4.3
 */

export interface PerformanceMetrics {
  fps: number;
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  animationDuration: number;
  timestamp: number;
}

export interface NavigationMetrics {
  from: string;
  to: string;
  duration: number;
  fps: number;
  timestamp: number;
}

class PerformanceMonitor {
  private frameCount = 0;
  private lastFrameTime = 0;
  private fps = 0;
  private navigationStart = 0;
  private metrics: PerformanceMetrics[] = [];
  private navigationMetrics: NavigationMetrics[] = [];
  private rafId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.startFPSMonitoring();
    }
  }

  /**
   * Start monitoring FPS
   */
  private startFPSMonitoring() {
    const measureFPS = (timestamp: number) => {
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        this.fps = Math.round(1000 / delta);
        this.frameCount++;
      }
      this.lastFrameTime = timestamp;
      this.rafId = requestAnimationFrame(measureFPS);
    };

    this.rafId = requestAnimationFrame(measureFPS);
  }

  /**
   * Stop monitoring FPS
   */
  stopFPSMonitoring() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    return this.fps;
  }

  /**
   * Get average FPS over a period
   */
  getAverageFPS(duration: number = 1000): Promise<number> {
    return new Promise((resolve) => {
      const samples: number[] = [];
      const startTime = performance.now();

      const measure = () => {
        samples.push(this.fps);
        
        if (performance.now() - startTime < duration) {
          requestAnimationFrame(measure);
        } else {
          const average = samples.reduce((a, b) => a + b, 0) / samples.length;
          resolve(Math.round(average));
        }
      };

      requestAnimationFrame(measure);
    });
  }

  /**
   * Start navigation timing
   */
  startNavigation(from: string, to: string) {
    this.navigationStart = performance.now();
    
    if (typeof window !== 'undefined') {
      console.log(`[Performance] Navigation started: ${from} → ${to}`);
    }
  }

  /**
   * End navigation timing
   */
  endNavigation(from: string, to: string) {
    const duration = performance.now() - this.navigationStart;
    const fps = this.fps;

    const metric: NavigationMetrics = {
      from,
      to,
      duration,
      fps,
      timestamp: Date.now(),
    };

    this.navigationMetrics.push(metric);

    if (typeof window !== 'undefined') {
      console.log(`[Performance] Navigation completed: ${from} → ${to}`);
      console.log(`  Duration: ${duration.toFixed(2)}ms`);
      console.log(`  FPS: ${fps}`);
    }

    return metric;
  }

  /**
   * Get page load metrics from Performance API
   */
  getPageLoadMetrics(): PerformanceMetrics | null {
    if (typeof window === 'undefined' || !window.performance) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    if (!navigation) {
      return null;
    }

    const fcp = paint.find(entry => entry.name === 'first-contentful-paint');

    const metrics: PerformanceMetrics = {
      fps: this.fps,
      pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
      timeToInteractive: navigation.domInteractive - navigation.fetchStart,
      firstContentfulPaint: fcp ? fcp.startTime : 0,
      animationDuration: 0,
      timestamp: Date.now(),
    };

    this.metrics.push(metrics);
    return metrics;
  }

  /**
   * Measure animation performance
   */
  async measureAnimation(callback: () => void, duration: number = 500): Promise<{
    averageFPS: number;
    minFPS: number;
    maxFPS: number;
    duration: number;
  }> {
    const samples: number[] = [];
    const startTime = performance.now();

    // Start measuring
    const measure = () => {
      samples.push(this.fps);
      
      if (performance.now() - startTime < duration) {
        requestAnimationFrame(measure);
      }
    };

    requestAnimationFrame(measure);

    // Execute animation
    callback();

    // Wait for duration
    await new Promise(resolve => setTimeout(resolve, duration));

    // Calculate results
    const averageFPS = samples.reduce((a, b) => a + b, 0) / samples.length;
    const minFPS = Math.min(...samples);
    const maxFPS = Math.max(...samples);

    return {
      averageFPS: Math.round(averageFPS),
      minFPS,
      maxFPS,
      duration: performance.now() - startTime,
    };
  }

  /**
   * Get all navigation metrics
   */
  getNavigationMetrics(): NavigationMetrics[] {
    return [...this.navigationMetrics];
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
    this.navigationMetrics = [];
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const navMetrics = this.getNavigationMetrics();
    const perfMetrics = this.getAllMetrics();

    let report = '='.repeat(80) + '\n';
    report += 'PERFORMANCE REPORT\n';
    report += '='.repeat(80) + '\n\n';

    // Navigation metrics
    if (navMetrics.length > 0) {
      report += 'Navigation Metrics:\n';
      report += '-'.repeat(80) + '\n';
      
      navMetrics.forEach((metric, index) => {
        report += `${index + 1}. ${metric.from} → ${metric.to}\n`;
        report += `   Duration: ${metric.duration.toFixed(2)}ms\n`;
        report += `   FPS: ${metric.fps}\n`;
        report += `   Status: ${metric.duration < 500 ? '✓ PASS' : '⚠ SLOW'}\n\n`;
      });

      const avgDuration = navMetrics.reduce((sum, m) => sum + m.duration, 0) / navMetrics.length;
      const avgFPS = navMetrics.reduce((sum, m) => sum + m.fps, 0) / navMetrics.length;

      report += `Average Navigation Duration: ${avgDuration.toFixed(2)}ms\n`;
      report += `Average FPS: ${Math.round(avgFPS)}\n\n`;
    }

    // Page load metrics
    if (perfMetrics.length > 0) {
      report += 'Page Load Metrics:\n';
      report += '-'.repeat(80) + '\n';

      const latest = perfMetrics[perfMetrics.length - 1];
      report += `Page Load Time: ${latest.pageLoadTime.toFixed(2)}ms\n`;
      report += `Time to Interactive: ${latest.timeToInteractive.toFixed(2)}ms\n`;
      report += `First Contentful Paint: ${latest.firstContentfulPaint.toFixed(2)}ms\n`;
      report += `Current FPS: ${latest.fps}\n\n`;
    }

    // Current status
    report += 'Current Status:\n';
    report += '-'.repeat(80) + '\n';
    report += `FPS: ${this.getCurrentFPS()}\n`;
    report += `Frame Count: ${this.frameCount}\n`;
    report += `Status: ${this.getCurrentFPS() >= 55 ? '✓ GOOD' : '⚠ LOW FPS'}\n\n`;

    report += '='.repeat(80) + '\n';

    return report;
  }

  /**
   * Log performance report to console
   */
  logReport() {
    console.log(this.generateReport());
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): {
    acceptable: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const navMetrics = this.getNavigationMetrics();

    // Check FPS
    if (this.getCurrentFPS() < 55) {
      issues.push(`Low FPS: ${this.getCurrentFPS()} (target: 60)`);
    }

    // Check navigation duration
    const slowNavigations = navMetrics.filter(m => m.duration > 500);
    if (slowNavigations.length > 0) {
      issues.push(`${slowNavigations.length} slow navigation(s) detected (> 500ms)`);
    }

    // Check page load metrics
    const perfMetrics = this.getAllMetrics();
    if (perfMetrics.length > 0) {
      const latest = perfMetrics[perfMetrics.length - 1];
      
      if (latest.timeToInteractive > 3000) {
        issues.push(`Slow Time to Interactive: ${latest.timeToInteractive.toFixed(0)}ms (target: < 3000ms)`);
      }

      if (latest.firstContentfulPaint > 1500) {
        issues.push(`Slow First Contentful Paint: ${latest.firstContentfulPaint.toFixed(0)}ms (target: < 1500ms)`);
      }
    }

    return {
      acceptable: issues.length === 0,
      issues,
    };
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

export function resetPerformanceMonitor() {
  if (performanceMonitor) {
    performanceMonitor.stopFPSMonitoring();
    performanceMonitor = null;
  }
}

// Export for testing
export { PerformanceMonitor };
