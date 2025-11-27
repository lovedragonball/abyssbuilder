'use client'

/**
 * Edge Case Testing Demo Page
 * 
 * Interactive testing interface for page navigation edge cases
 * Requirements: 4.2, 4.3
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function EdgeCaseTestingPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [testResults, setTestResults] = useState<Array<{
    test: string
    status: 'pending' | 'running' | 'passed' | 'failed'
    message: string
    timestamp: number
  }>>([])
  const [isRunning, setIsRunning] = useState(false)
  const [navigationLog, setNavigationLog] = useState<Array<{
    from: string
    to: string
    timestamp: number
    duration: number
  }>>([])
  const navigationStartTime = useRef<number>(0)
  const previousPath = useRef<string>(pathname)

  const pages = [
    { path: '/', label: 'Home' },
    { path: '/my-builds', label: 'My Builds' },
    { path: '/tier-list', label: 'Tier List' },
    { path: '/map', label: 'Interactive Map' },
    { path: '/attribute-optimizer', label: 'Attribute Optimizer' },
    { path: '/materials', label: 'Materials' },
    { path: '/news', label: 'News' },
  ]

  useEffect(() => {
    if (previousPath.current !== pathname) {
      const duration = Date.now() - navigationStartTime.current
      setNavigationLog(prev => [...prev, {
        from: previousPath.current,
        to: pathname,
        timestamp: Date.now(),
        duration
      }])
      previousPath.current = pathname
    }
  }, [pathname])

  const addTestResult = (test: string, status: 'passed' | 'failed', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: Date.now()
    }])
  }

  const navigate = (path: string) => {
    navigationStartTime.current = Date.now()
    router.push(path)
  }

  // Test 1: Same Page Navigation
  const testSamePageNavigation = async () => {
    addTestResult('Same Page Navigation', 'running', 'Starting test...')
    
    try {
      const currentPath = pathname
      
      // Click same page multiple times
      for (let i = 0; i < 3; i++) {
        navigate(currentPath)
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      if (pathname === currentPath) {
        addTestResult('Same Page Navigation', 'passed', 'Page remained stable after multiple same-page clicks')
      } else {
        addTestResult('Same Page Navigation', 'failed', 'Unexpected navigation occurred')
      }
    } catch (error) {
      addTestResult('Same Page Navigation', 'failed', `Error: ${error}`)
    }
  }

  // Test 2: Rapid Navigation
  const testRapidNavigation = async () => {
    addTestResult('Rapid Navigation', 'running', 'Starting rapid navigation test...')
    
    try {
      const testPages = ['/my-builds', '/tier-list', '/map', '/attribute-optimizer', '/materials']
      
      // Rapidly navigate through pages
      for (const page of testPages) {
        navigate(page)
        await new Promise(resolve => setTimeout(resolve, 200)) // 200ms between navigations
      }
      
      // Wait for final navigation to complete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (pathname === testPages[testPages.length - 1]) {
        addTestResult('Rapid Navigation', 'passed', `Successfully navigated to final page: ${pathname}`)
      } else {
        addTestResult('Rapid Navigation', 'failed', `Expected ${testPages[testPages.length - 1]}, got ${pathname}`)
      }
    } catch (error) {
      addTestResult('Rapid Navigation', 'failed', `Error: ${error}`)
    }
  }

  // Test 3: Navigation During Animation
  const testNavigationDuringAnimation = async () => {
    addTestResult('Navigation During Animation', 'running', 'Starting test...')
    
    try {
      // Start first navigation
      navigate('/my-builds')
      
      // Immediately start second navigation (within animation time)
      await new Promise(resolve => setTimeout(resolve, 100))
      navigate('/tier-list')
      
      // Wait for animations to complete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (pathname === '/tier-list') {
        addTestResult('Navigation During Animation', 'passed', 'Second navigation completed successfully')
      } else {
        addTestResult('Navigation During Animation', 'failed', `Expected /tier-list, got ${pathname}`)
      }
    } catch (error) {
      addTestResult('Navigation During Animation', 'failed', `Error: ${error}`)
    }
  }

  // Test 4: Back/Forward Navigation
  const testBackForwardNavigation = async () => {
    addTestResult('Back/Forward Navigation', 'running', 'Starting test...')
    
    try {
      const startPath = pathname
      
      // Navigate forward
      navigate('/my-builds')
      await new Promise(resolve => setTimeout(resolve, 700))
      
      navigate('/tier-list')
      await new Promise(resolve => setTimeout(resolve, 700))
      
      // Navigate back
      router.back()
      await new Promise(resolve => setTimeout(resolve, 700))
      
      if (pathname === '/my-builds') {
        addTestResult('Back/Forward Navigation', 'passed', 'Back navigation worked correctly')
      } else {
        addTestResult('Back/Forward Navigation', 'failed', `Expected /my-builds after back, got ${pathname}`)
      }
    } catch (error) {
      addTestResult('Back/Forward Navigation', 'failed', `Error: ${error}`)
    }
  }

  // Test 5: Stress Test
  const testStressTest = async () => {
    addTestResult('Stress Test', 'running', 'Starting stress test with 20 rapid navigations...')
    
    try {
      const testPages = ['/my-builds', '/tier-list', '/map', '/materials']
      
      for (let i = 0; i < 20; i++) {
        const randomPage = testPages[Math.floor(Math.random() * testPages.length)]
        navigate(randomPage)
        await new Promise(resolve => setTimeout(resolve, 150))
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      addTestResult('Stress Test', 'passed', 'Completed 20 rapid navigations without errors')
    } catch (error) {
      addTestResult('Stress Test', 'failed', `Error: ${error}`)
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])
    setNavigationLog([])
    
    await testSamePageNavigation()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testRapidNavigation()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testNavigationDuringAnimation()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testBackForwardNavigation()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testStressTest()
    
    setIsRunning(false)
  }

  const clearResults = () => {
    setTestResults([])
    setNavigationLog([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'running': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return '✅'
      case 'failed': return '❌'
      case 'running': return '⏳'
      default: return '⏸️'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Edge Case Testing Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Navigation Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Navigation</h2>
          <p className="text-sm text-gray-600 mb-4">
            Current Page: <span className="font-mono font-bold">{pathname}</span>
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {pages.map(page => (
              <Button
                key={page.path}
                onClick={() => navigate(page.path)}
                variant={pathname === page.path ? 'default' : 'outline'}
                className="w-full"
              >
                {page.label}
              </Button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold mb-2">Browser Controls</h3>
            <div className="flex gap-2">
              <Button onClick={() => router.back()} variant="outline" size="sm">
                ← Back
              </Button>
              <Button onClick={() => router.forward()} variant="outline" size="sm">
                Forward →
              </Button>
              <Button onClick={() => router.refresh()} variant="outline" size="sm">
                🔄 Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Automated Tests Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Automated Tests</h2>
          
          <div className="space-y-2 mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={testSamePageNavigation} 
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                Same Page
              </Button>
              <Button 
                onClick={testRapidNavigation} 
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                Rapid Nav
              </Button>
              <Button 
                onClick={testNavigationDuringAnimation} 
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                During Animation
              </Button>
              <Button 
                onClick={testBackForwardNavigation} 
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                Back/Forward
              </Button>
              <Button 
                onClick={testStressTest} 
                disabled={isRunning}
                variant="outline"
                size="sm"
                className="col-span-2"
              >
                Stress Test
              </Button>
            </div>
            
            <Button 
              onClick={clearResults} 
              variant="outline"
              size="sm"
              className="w-full"
            >
              Clear Results
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p>Tests: {testResults.length}</p>
            <p>Passed: {testResults.filter(r => r.status === 'passed').length}</p>
            <p>Failed: {testResults.filter(r => r.status === 'failed').length}</p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        
        {testResults.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tests run yet. Click "Run All Tests" to begin.</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className="border rounded p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getStatusIcon(result.status)}</span>
                      <span className="font-semibold">{result.test}</span>
                      <span className={`text-sm ${getStatusColor(result.status)}`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 ml-8">{result.message}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Log */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Navigation Log</h2>
        
        {navigationLog.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No navigations logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">From</th>
                  <th className="text-left p-2">To</th>
                  <th className="text-right p-2">Duration (ms)</th>
                </tr>
              </thead>
              <tbody>
                {navigationLog.slice(-20).reverse().map((log, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-gray-600">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-2 font-mono text-xs">{log.from}</td>
                    <td className="p-2 font-mono text-xs">{log.to}</td>
                    <td className="p-2 text-right">
                      <span className={log.duration > 1000 ? 'text-red-600' : 'text-green-600'}>
                        {log.duration}ms
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">Testing Instructions</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Manual Testing:</strong> Use the navigation buttons to manually test edge cases.</p>
          <p><strong>Automated Testing:</strong> Run individual tests or all tests to verify behavior.</p>
          <p><strong>Browser Testing:</strong> Test with browser back/forward buttons and refresh.</p>
          <p><strong>Network Testing:</strong> Open DevTools → Network tab and throttle to "Slow 3G" to test slow network conditions.</p>
          <p><strong>Monitoring:</strong> Watch the navigation log for timing and the test results for pass/fail status.</p>
        </div>
      </div>
    </div>
  )
}
