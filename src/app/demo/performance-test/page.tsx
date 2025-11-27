'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { usePageTransitionPerformance, performanceMonitor } from '@/lib/page-transition-performance'

/**
 * Performance Test Demo Page
 * 
 * Demonstrates and tests page transition performance optimizations:
 * - Real-time FPS monitoring
 * - Transition duration measurement
 * - Performance metrics visualization
 * - Comparison between optimized and non-optimized versions
 */
export default function PerformanceTestPage() {
  const router = useRouter()
  const { currentMetrics, startMonitoring, stopMonitoring, getReport, meetsTarget } = usePageTransitionPerformance()
  const [isMonitoring, setIsMonitoring] = React.useState(false)
  const [report, setReport] = React.useState('')
  const [testResults, setTestResults] = React.useState<Array<{
    page: string
    metrics: any
    passed: boolean
  }>>([])

  // Test pages for navigation
  const testPages = [
    { name: 'Home', path: '/' },
    { name: 'My Builds', path: '/my-builds' },
    { name: 'Tier List', path: '/tier-list' },
    { name: 'Map', path: '/map' },
    { name: 'Materials', path: '/materials' },
  ]

  const handleStartMonitoring = () => {
    setIsMonitoring(true)
    startMonitoring()
  }

  const handleStopMonitoring = () => {
    setIsMonitoring(false)
    const metrics = stopMonitoring()
    const newReport = getReport()
    setReport(newReport)
    
    if (metrics) {
      console.log('Performance Metrics:', metrics)
      console.log('Meets 60fps target:', meetsTarget())
    }
  }

  const handleNavigateAndTest = async (path: string, pageName: string) => {
    handleStartMonitoring()
    
    // Wait a bit before navigation to ensure monitoring is active
    await new Promise(resolve => setTimeout(resolve, 100))
    
    router.push(path)
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const metrics = stopMonitoring()
    setIsMonitoring(false)
    
    if (metrics) {
      const passed = metrics.averageFPS >= 58 && metrics.droppedFrames / metrics.frameCount < 0.1
      setTestResults(prev => [...prev, {
        page: pageName,
        metrics,
        passed
      }])
    }
  }

  const handleRunFullTest = async () => {
    setTestResults([])
    
    for (const page of testPages) {
      await handleNavigateAndTest(page.path, page.name)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    const newReport = getReport()
    setReport(newReport)
  }

  const handleClearResults = () => {
    setTestResults([])
    setReport('')
    performanceMonitor.clearMetrics()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Page Transition Performance Test</h1>
        <p className="text-muted-foreground">
          Monitor and test page transition performance to ensure 60fps animations
        </p>
      </div>

      {/* Performance Optimizations Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Performance Optimizations Applied
        </h2>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>Reduced animation duration from 0.4s to 0.3s for snappier feel</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>Optimized easing curves for smoother 60fps animations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>Reduced transform values (y: 10px instead of 20px) for faster GPU processing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>Added React.memo to prevent unnecessary re-renders</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>Memoized callbacks and values to optimize performance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>Added will-change CSS property for GPU acceleration</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>Reduced fallback delay from 1000ms to 800ms</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>Used MotionConfig for global performance settings</span>
          </li>
        </ul>
      </div>

      {/* Manual Monitoring Controls */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Manual Performance Monitoring</h2>
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleStartMonitoring}
            disabled={isMonitoring}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            Start Monitoring
          </button>
          <button
            onClick={handleStopMonitoring}
            disabled={!isMonitoring}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            Stop Monitoring
          </button>
        </div>
        
        {isMonitoring && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              🎬 Monitoring active... Navigate to different pages to measure performance.
            </p>
          </div>
        )}

        {currentMetrics && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Latest Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Duration</div>
                <div className="text-lg font-semibold">{currentMetrics.transitionDuration.toFixed(0)}ms</div>
              </div>
              <div>
                <div className="text-muted-foreground">Average FPS</div>
                <div className={`text-lg font-semibold ${currentMetrics.averageFPS >= 58 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentMetrics.averageFPS}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Min FPS</div>
                <div className="text-lg font-semibold">{currentMetrics.minFPS}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Max FPS</div>
                <div className="text-lg font-semibold">{currentMetrics.maxFPS}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Frames</div>
                <div className="text-lg font-semibold">{currentMetrics.frameCount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Dropped Frames</div>
                <div className={`text-lg font-semibold ${currentMetrics.droppedFrames === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {currentMetrics.droppedFrames}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Automated Testing */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Automated Performance Testing</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Test navigation performance across multiple pages automatically
        </p>
        
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleRunFullTest}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Run Full Test Suite
          </button>
          <button
            onClick={handleClearResults}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Clear Results
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results</h3>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  result.passed
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{result.page}</h4>
                  <span className={`text-sm font-medium ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {result.passed ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-medium">{result.metrics.transitionDuration.toFixed(0)}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg FPS: </span>
                    <span className="font-medium">{result.metrics.averageFPS}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dropped: </span>
                    <span className="font-medium">{result.metrics.droppedFrames}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Report */}
      {report && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Report</h2>
          <pre className="bg-gray-50 dark:bg-gray-900 rounded p-4 text-sm overflow-auto">
            {report}
          </pre>
        </div>
      )}

      {/* Quick Navigation Links */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Navigation (for manual testing)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {testPages.map((page) => (
            <button
              key={page.path}
              onClick={() => router.push(page.path)}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
            >
              {page.name}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Tips</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Target: Average FPS should be ≥ 58 (allowing 2fps margin for 60fps target)</li>
          <li>• Dropped frames should be &lt; 10% of total frames</li>
          <li>• Transition duration should be &lt; 500ms for good UX</li>
          <li>• Use Chrome DevTools Performance tab for detailed analysis</li>
          <li>• Test on lower-end devices for realistic performance metrics</li>
          <li>• Monitor memory usage to prevent leaks during transitions</li>
        </ul>
      </div>
    </div>
  )
}
