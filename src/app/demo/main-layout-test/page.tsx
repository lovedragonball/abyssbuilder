/**
 * MainLayout Test Page
 * 
 * This page demonstrates and tests the MainLayout component functionality:
 * - Safe page transitions with error boundary
 * - Loading indicators
 * - Configuration options
 * - Error handling
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MainLayoutTestPage() {
  const pathname = usePathname();
  const [testResults, setTestResults] = React.useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  React.useEffect(() => {
    addTestResult(`Page loaded: ${pathname}`);
  }, [pathname]);

  const testPages = [
    { href: '/my-builds', label: 'My Builds' },
    { href: '/tier-list', label: 'Tier List' },
    { href: '/map', label: 'Interactive Map' },
    { href: '/attribute-optimizer', label: 'Attribute Optimizer' },
    { href: '/materials', label: 'Materials/Forging' },
    { href: '/news', label: 'News & Updates' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">MainLayout Test Page</h1>
        <p className="text-blue-100">
          Test the updated MainLayout component with SafePageTransition, loading indicators, and error handling
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">✅</span>
            Implemented Features
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>SafePageTransition wrapper with error boundary</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Loading indicator during page transitions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Configurable page transition settings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Header and Navigation remain functional</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Fallback UI for animation errors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Accessibility support (ARIA attributes)</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            Configuration
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Animation:</span>
              <span className="ml-2 text-green-500">Enabled</span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Fallback Delay:</span>
              <span className="ml-2">1000ms</span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Duration:</span>
              <span className="ml-2">0.4s</span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Error Boundary:</span>
              <span className="ml-2 text-green-500">Active</span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Loading Indicator:</span>
              <span className="ml-2 text-green-500">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Test */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Click on these links to test page transitions. Watch for:
        </p>
        <ul className="text-sm text-muted-foreground mb-6 space-y-1">
          <li>• Loading indicator at the top of the page</li>
          <li>• Smooth fade animations between pages</li>
          <li>• No blank pages or stuck animations</li>
          <li>• Header remains visible and functional</li>
        </ul>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {testPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="px-4 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-center transition-colors"
            >
              {page.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Test Results Log */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Test Results Log</h2>
        <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No test results yet. Navigate to different pages to see logs.
            </p>
          ) : (
            <ul className="space-y-1 text-sm font-mono">
              {testResults.map((result, index) => (
                <li key={index} className="text-foreground">
                  {result}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={() => setTestResults([])}
          className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm transition-colors"
        >
          Clear Log
        </button>
      </div>

      {/* Component Structure */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Component Structure</h2>
        <div className="bg-muted rounded-lg p-4 overflow-x-auto">
          <pre className="text-xs font-mono">
{`<div className="min-h-screen bg-background">
  <NavigationProgress />
  <Header />
  {isLoading && <LoadingIndicator />}
  <SafePageTransition fallback={<FallbackUI />}>
    <PageTransition config={PAGE_TRANSITION_CONFIG}>
      <main id="main-content">
        {children}
      </main>
    </PageTransition>
  </SafePageTransition>
</div>`}
          </pre>
        </div>
      </div>

      {/* Requirements Verification */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Requirements Verification</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-xl">✓</span>
            <div>
              <p className="font-medium">Requirement 3.1</p>
              <p className="text-sm text-muted-foreground">
                PageTransition component does not block rendering of children components
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-xl">✓</span>
            <div>
              <p className="font-medium">Requirement 3.3</p>
              <p className="text-sm text-muted-foreground">
                Animation triggers correctly and new content displays when pathname changes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Links */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Documentation</h2>
        <p className="text-sm text-muted-foreground mb-4">
          For more information about the MainLayout component:
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <span className="font-medium">Component:</span>
            <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
              src/components/layout/main-layout.tsx
            </code>
          </li>
          <li>
            <span className="font-medium">Documentation:</span>
            <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
              src/components/layout/README-main-layout.md
            </code>
          </li>
          <li>
            <span className="font-medium">Tests:</span>
            <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
              src/components/layout/__tests__/main-layout.test.tsx
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
}
