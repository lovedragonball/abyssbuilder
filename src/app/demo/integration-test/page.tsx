'use client';

/**
 * Integration Testing Demo Page
 * Interactive testing interface for manual integration tests
 * Requirements: 4.1, 4.2, 4.3
 */

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getPerformanceMonitor } from '@/lib/performance-monitor';

const pages = [
  { path: '/', name: 'Home', icon: '🏠' },
  { path: '/my-builds', name: 'My Builds', icon: '⚔️' },
  { path: '/tier-list', name: 'Tier List', icon: '📊' },
  { path: '/map', name: 'Interactive Map', icon: '🗺️' },
  { path: '/attribute-optimizer', name: 'Attribute Optimizer', icon: '⚡' },
  { path: '/materials', name: 'Materials', icon: '🔨' },
  { path: '/news', name: 'News', icon: '📰' },
];

export default function IntegrationTestPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [fps, setFps] = useState(0);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isAutoTesting, setIsAutoTesting] = useState(false);
  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);

  useEffect(() => {
    const monitor = getPerformanceMonitor();

    // Update FPS display
    const fpsInterval = setInterval(() => {
      setFps(monitor.getCurrentFPS());
    }, 100);

    // Capture console errors
    const originalError = console.error;
    console.error = (...args: any[]) => {
      setConsoleErrors(prev => [...prev, args.join(' ')]);
      originalError(...args);
    };

    return () => {
      clearInterval(fpsInterval);
      console.error = originalError;
    };
  }, []);

  const handleNavigation = (path: string, pageName: string) => {
    const monitor = getPerformanceMonitor();
    monitor.startNavigation(pathname, path);

    setNavigationHistory(prev => [...prev, `${pathname} → ${path}`]);

    router.push(path);

    setTimeout(() => {
      const metric = monitor.endNavigation(pathname, path);
      setTestResults(prev => [...prev, {
        from: pathname,
        to: path,
        name: pageName,
        duration: metric.duration,
        fps: metric.fps,
        status: metric.duration < 500 ? 'PASS' : 'SLOW',
        timestamp: new Date().toISOString(),
      }]);
    }, 100);
  };

  const runAutoTest = async () => {
    setIsAutoTesting(true);
    setTestResults([]);
    setNavigationHistory([]);
    setConsoleErrors([]);

    for (const page of pages) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleNavigation(page.path, page.name);
    }

    setIsAutoTesting(false);
  };

  const clearResults = () => {
    setTestResults([]);
    setNavigationHistory([]);
    setConsoleErrors([]);
    const monitor = getPerformanceMonitor();
    monitor.clearMetrics();
  };

  const exportResults = () => {
    const monitor = getPerformanceMonitor();
    const report = monitor.generateReport();
    
    const fullReport = `
# Integration Test Results
Generated: ${new Date().toISOString()}

## Test Results
${testResults.map((result, index) => `
### Test ${index + 1}: ${result.name}
- From: ${result.from}
- To: ${result.to}
- Duration: ${result.duration.toFixed(2)}ms
- FPS: ${result.fps}
- Status: ${result.status}
- Timestamp: ${result.timestamp}
`).join('\n')}

## Console Errors
${consoleErrors.length === 0 ? 'No errors detected ✓' : consoleErrors.map((error, index) => `${index + 1}. ${error}`).join('\n')}

## Performance Report
${report}
`;

    const blob = new Blob([fullReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-test-results-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const avgDuration = testResults.length > 0
    ? testResults.reduce((sum, r) => sum + r.duration, 0) / testResults.length
    : 0;

  const avgFPS = testResults.length > 0
    ? testResults.reduce((sum, r) => sum + r.fps, 0) / testResults.length
    : 0;

  const passedTests = testResults.filter(r => r.status === 'PASS').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Integration Testing Dashboard</h1>
          <p className="text-gray-600 mb-4">
            Manual and automated testing interface for page navigation
          </p>

          {/* Performance Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Current FPS</div>
              <div className={`text-2xl font-bold ${fps >= 55 ? 'text-green-600' : 'text-red-600'}`}>
                {fps}
              </div>
              <div className="text-xs text-gray-500">Target: 60</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Tests Passed</div>
              <div className="text-2xl font-bold text-green-600">
                {passedTests}/{testResults.length}
              </div>
              <div className="text-xs text-gray-500">
                {testResults.length > 0 ? `${Math.round((passedTests / testResults.length) * 100)}%` : '0%'}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Avg Duration</div>
              <div className={`text-2xl font-bold ${avgDuration < 500 ? 'text-green-600' : 'text-orange-600'}`}>
                {avgDuration.toFixed(0)}ms
              </div>
              <div className="text-xs text-gray-500">Target: &lt; 500ms</div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Console Errors</div>
              <div className={`text-2xl font-bold ${consoleErrors.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {consoleErrors.length}
              </div>
              <div className="text-xs text-gray-500">Target: 0</div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={runAutoTest}
              disabled={isAutoTesting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isAutoTesting ? '🔄 Running Tests...' : '▶️ Run Auto Test'}
            </button>

            <button
              onClick={clearResults}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🗑️ Clear Results
            </button>

            <button
              onClick={exportResults}
              disabled={testResults.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              📥 Export Results
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Manual Navigation */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Manual Navigation</h2>
            <p className="text-sm text-gray-600 mb-4">
              Click buttons to test navigation manually
            </p>

            <div className="space-y-2">
              {pages.map((page) => (
                <button
                  key={page.path}
                  onClick={() => handleNavigation(page.path, page.name)}
                  disabled={isAutoTesting}
                  className={`w-full p-3 text-left rounded-lg transition-colors ${
                    pathname === page.path
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="mr-2">{page.icon}</span>
                  <span className="font-medium">{page.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({page.path})</span>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Current Page:</div>
              <div className="text-lg font-bold text-blue-600">{pathname}</div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test Results</h2>
            
            {testResults.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">📊</div>
                <div>No tests run yet</div>
                <div className="text-sm">Click "Run Auto Test" or navigate manually</div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 ${
                      result.status === 'PASS'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium">{result.name}</div>
                      <div className={`text-sm font-bold ${
                        result.status === 'PASS' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {result.status}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.from} → {result.to}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>⏱️ {result.duration.toFixed(2)}ms</span>
                      <span>📊 {result.fps} FPS</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {testResults.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Summary:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total Tests: {testResults.length}</div>
                  <div>Passed: {passedTests}</div>
                  <div>Avg Duration: {avgDuration.toFixed(2)}ms</div>
                  <div>Avg FPS: {Math.round(avgFPS)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation History */}
        {navigationHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Navigation History</h2>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {navigationHistory.map((nav, index) => (
                <div key={index} className="text-sm text-gray-600 font-mono">
                  {index + 1}. {nav}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Console Errors */}
        {consoleErrors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-red-700 mb-4">
              ⚠️ Console Errors ({consoleErrors.length})
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {consoleErrors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 font-mono bg-white p-2 rounded">
                  {index + 1}. {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testing Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-blue-700 mb-4">📋 Testing Instructions</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <div className="font-medium mb-1">1. Automated Testing:</div>
              <div className="ml-4">Click "Run Auto Test" to automatically navigate through all pages</div>
            </div>
            <div>
              <div className="font-medium mb-1">2. Manual Testing:</div>
              <div className="ml-4">Click individual page buttons to test specific navigation paths</div>
            </div>
            <div>
              <div className="font-medium mb-1">3. Browser Testing:</div>
              <div className="ml-4">Test this page in Chrome, Firefox, Safari, and Edge</div>
            </div>
            <div>
              <div className="font-medium mb-1">4. Performance Monitoring:</div>
              <div className="ml-4">Watch the FPS counter and duration metrics during navigation</div>
            </div>
            <div>
              <div className="font-medium mb-1">5. Export Results:</div>
              <div className="ml-4">Click "Export Results" to download a detailed test report</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
