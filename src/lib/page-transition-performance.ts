/**
 * Page Transition Performance Monitoring Utility
 * 
 * Provides tools to measure and monitor page transition performance:
 * - Animation frame rate tracking
 * - Transition duration measurement
 * - Performance metrics collection
 * - Bundle size impact analysis
 */

export interface PerformanceMetrics {
  transitionDuration: number
  averageFPS: number
  minFPS: number
  maxFPS: number
  frameCount: number
  droppedFrames: number
  timestamp: number
}

export interface BundleMetrics {
  framerMotionSize: number
  componentSize: number
  totalSize: number
}

class PageTransitionPerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private isMonitoring = false
  private frameTimestamps: number[] = []
  private animationStartTime = 0
  private rafId: number | null = null

  /**
   * Start monitoring animation performance
   */
  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.frameTimestamps = []
    this.animationStartTime = performance.now()

    this.measureFrameRate()
  }

  /**
   * Stop monitoring and return metrics
   */
  stopMonitoring(): PerformanceMetrics | null {
    if (!this.isMonitoring) return null

    this.isMonitoring = false

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    const transitionDuration = performance.now() - this.animationStartTime
    const metrics = this.calculateMetrics(transitionDuration)

    this.metrics.push(metrics)

    // Keep only last 100 measurements
    if (this.metrics.length > 100) {
      this.metrics.shift()
    }

    return metrics
  }

  /**
   * Measure frame rate using requestAnimationFrame
   */
  private measureFrameRate = (): void => {
    if (!this.isMonitoring) return

    const now = performance.now()
    this.frameTimestamps.push(now)

    this.rafId = requestAnimationFrame(this.measureFrameRate)
  }

  /**
   * Calculate performance metrics from frame timestamps
   */
  private calculateMetrics(transitionDuration: number): PerformanceMetrics {
    const frameCount = this.frameTimestamps.length

    if (frameCount < 2) {
      return {
        transitionDuration,
        averageFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        frameCount: 0,
        droppedFrames: 0,
        timestamp: Date.now(),
      }
    }

    // Calculate FPS for each frame
    const fpsValues: number[] = []
    for (let i = 1; i < frameCount; i++) {
      const frameDuration = this.frameTimestamps[i] - this.frameTimestamps[i - 1]
      const fps = 1000 / frameDuration
      fpsValues.push(fps)
    }

    const averageFPS = fpsValues.reduce((sum, fps) => sum + fps, 0) / fpsValues.length
    const minFPS = Math.min(...fpsValues)
    const maxFPS = Math.max(...fpsValues)

    // Calculate dropped frames (frames below 55 FPS)
    const droppedFrames = fpsValues.filter(fps => fps < 55).length

    return {
      transitionDuration,
      averageFPS: Math.round(averageFPS),
      minFPS: Math.round(minFPS),
      maxFPS: Math.round(maxFPS),
      frameCount,
      droppedFrames,
      timestamp: Date.now(),
    }
  }

  /**
   * Get all collected metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * Get average metrics across all measurements
   */
  getAverageMetrics(): Omit<PerformanceMetrics, 'timestamp'> | null {
    if (this.metrics.length === 0) return null

    const sum = this.metrics.reduce(
      (acc, metric) => ({
        transitionDuration: acc.transitionDuration + metric.transitionDuration,
        averageFPS: acc.averageFPS + metric.averageFPS,
        minFPS: acc.minFPS + metric.minFPS,
        maxFPS: acc.maxFPS + metric.maxFPS,
        frameCount: acc.frameCount + metric.frameCount,
        droppedFrames: acc.droppedFrames + metric.droppedFrames,
      }),
      {
        transitionDuration: 0,
        averageFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        frameCount: 0,
        droppedFrames: 0,
      }
    )

    const count = this.metrics.length

    return {
      transitionDuration: Math.round(sum.transitionDuration / count),
      averageFPS: Math.round(sum.averageFPS / count),
      minFPS: Math.round(sum.minFPS / count),
      maxFPS: Math.round(sum.maxFPS / count),
      frameCount: Math.round(sum.frameCount / count),
      droppedFrames: Math.round(sum.droppedFrames / count),
    }
  }

  /**
   * Check if performance meets 60fps target
   */
  meetsPerformanceTarget(): boolean {
    const avgMetrics = this.getAverageMetrics()
    if (!avgMetrics) return false

    // Target: average FPS >= 58 (allowing 2fps margin)
    // and dropped frames < 10% of total frames
    return (
      avgMetrics.averageFPS >= 58 &&
      avgMetrics.droppedFrames / avgMetrics.frameCount < 0.1
    )
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const avgMetrics = this.getAverageMetrics()
    if (!avgMetrics) return 'No metrics collected'

    const meetsTarget = this.meetsPerformanceTarget()
    const droppedFramePercentage = (
      (avgMetrics.droppedFrames / avgMetrics.frameCount) *
      100
    ).toFixed(1)

    return `
Page Transition Performance Report
===================================
Measurements: ${this.metrics.length}
Average Transition Duration: ${avgMetrics.transitionDuration}ms
Average FPS: ${avgMetrics.averageFPS}
Min FPS: ${avgMetrics.minFPS}
Max FPS: ${avgMetrics.maxFPS}
Average Frame Count: ${avgMetrics.frameCount}
Dropped Frames: ${avgMetrics.droppedFrames} (${droppedFramePercentage}%)
Performance Target (60fps): ${meetsTarget ? '✓ PASS' : '✗ FAIL'}
    `.trim()
  }

  /**
   * Clear all collected metrics
   */
  clearMetrics(): void {
    this.metrics = []
  }
}

// Singleton instance
export const performanceMonitor = new PageTransitionPerformanceMonitor()

/**
 * Hook to monitor page transition performance
 */
export function usePageTransitionPerformance() {
  const [currentMetrics, setCurrentMetrics] = React.useState<PerformanceMetrics | null>(null)

  const startMonitoring = React.useCallback(() => {
    performanceMonitor.startMonitoring()
  }, [])

  const stopMonitoring = React.useCallback(() => {
    const metrics = performanceMonitor.stopMonitoring()
    setCurrentMetrics(metrics)
    return metrics
  }, [])

  const getReport = React.useCallback(() => {
    return performanceMonitor.generateReport()
  }, [])

  const meetsTarget = React.useCallback(() => {
    return performanceMonitor.meetsPerformanceTarget()
  }, [])

  return {
    currentMetrics,
    startMonitoring,
    stopMonitoring,
    getReport,
    meetsTarget,
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor),
  }
}

/**
 * Analyze bundle size impact
 */
export async function analyzeBundleSize(): Promise<BundleMetrics> {
  // This is a placeholder - actual implementation would require build-time analysis
  // In a real scenario, you'd use webpack-bundle-analyzer or similar tools
  
  console.log('Bundle size analysis should be performed using webpack-bundle-analyzer')
  console.log('Run: npm run build && npm run analyze')
  
  return {
    framerMotionSize: 0, // Would be populated by actual analysis
    componentSize: 0,
    totalSize: 0,
  }
}

/**
 * Performance testing utility for automated tests
 */
export class PerformanceTester {
  private monitor = new PageTransitionPerformanceMonitor()

  async testTransitionPerformance(
    transitionFn: () => Promise<void>,
    iterations = 10
  ): Promise<{
    passed: boolean
    averageMetrics: Omit<PerformanceMetrics, 'timestamp'> | null
    report: string
  }> {
    for (let i = 0; i < iterations; i++) {
      this.monitor.startMonitoring()
      await transitionFn()
      await new Promise(resolve => setTimeout(resolve, 500)) // Wait for animation
      this.monitor.stopMonitoring()
    }

    const averageMetrics = this.monitor.getAverageMetrics()
    const passed = this.monitor.meetsPerformanceTarget()
    const report = this.monitor.generateReport()

    return {
      passed,
      averageMetrics,
      report,
    }
  }
}

// React import for hook
import React from 'react'
