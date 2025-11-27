'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  VIEWPORT_CONFIGS,
  runResponsiveTests,
  type ViewportConfig,
} from '@/lib/responsive-test-utils';

export default function ResponsiveTestPage() {
  const [currentViewport, setCurrentViewport] = useState<ViewportConfig | null>(null);
  const [testResults, setTestResults] = useState<ReturnType<typeof runResponsiveTests> | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Detect current viewport on mount
    const width = window.innerWidth;
    const config = VIEWPORT_CONFIGS.find((v) => Math.abs(v.width - width) < 50);
    setCurrentViewport(config || null);
  }, []);

  const runTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runResponsiveTests();
      setTestResults(results);
      setIsRunning(false);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Responsive Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Test responsive behavior across different device sizes
          </p>
        </div>

        {/* Current Viewport Info */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Current Viewport</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Width</div>
              <div className="text-2xl font-bold">{window.innerWidth}px</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Height</div>
              <div className="text-2xl font-bold">{window.innerHeight}px</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Device Type</div>
              <div className="text-2xl font-bold capitalize">
                {currentViewport?.deviceType || 'Unknown'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Device Name</div>
              <div className="text-2xl font-bold">
                {currentViewport?.name || 'Custom'}
              </div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex gap-4">
          <Button onClick={runTests} disabled={isRunning} size="lg">
            {isRunning ? 'Running Tests...' : 'Run Responsive Tests'}
          </Button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Test Summary</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <div className="text-3xl font-bold text-green-500">
                    {testResults.summary.passed}
                  </div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-lg">
                  <div className="text-3xl font-bold text-red-500">
                    {testResults.summary.failed}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-500">
                    {testResults.summary.warnings}
                  </div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
              </div>
            </div>

            {/* Touch Targets */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Touch Target Tests</h2>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {testResults.touchTargets.filter((t) => t.valid).length} /{' '}
                  {testResults.touchTargets.length} elements meet minimum size (44x44px)
                </div>
                {testResults.touchTargets.filter((t) => !t.valid).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="font-semibold text-red-500">Failed Elements:</div>
                    {testResults.touchTargets
                      .filter((t) => !t.valid)
                      .slice(0, 5)
                      .map((t, i) => (
                        <div key={i} className="text-sm text-muted-foreground">
                          • {t.message}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Text Readability */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Text Readability</h2>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {testResults.textReadability.filter((t) => t.valid).length} /{' '}
                  {testResults.textReadability.length} text elements are readable (≥16px)
                </div>
                {testResults.textReadability.filter((t) => !t.valid).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="font-semibold text-red-500">Issues Found:</div>
                    {testResults.textReadability
                      .filter((t) => !t.valid)
                      .slice(0, 5)
                      .map((t, i) => (
                        <div key={i} className="text-sm text-muted-foreground">
                          • {t.message}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Overflow Check */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Horizontal Overflow</h2>
              <div className="space-y-2">
                <div
                  className={`text-sm ${
                    testResults.overflow.hasOverflow
                      ? 'text-red-500'
                      : 'text-green-500'
                  }`}
                >
                  {testResults.overflow.message}
                </div>
                {testResults.overflow.hasOverflow && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    {testResults.overflow.elements.length} elements causing overflow
                  </div>
                )}
              </div>
            </div>

            {/* Image Optimization */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Image Optimization</h2>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Total images: {testResults.images.total}
                </div>
                <div className="text-sm text-muted-foreground">
                  With srcset: {testResults.images.withSrcset}
                </div>
                <div className="text-sm text-muted-foreground">
                  With lazy loading: {testResults.images.withLazyLoad}
                </div>
                {testResults.images.issues.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="font-semibold text-yellow-500">Issues:</div>
                    {testResults.images.issues.slice(0, 5).map((issue, i) => (
                      <div key={i} className="text-sm text-muted-foreground">
                        • {issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Viewport Reference */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Viewport Reference</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Mobile</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>320px - iPhone SE</div>
                <div>375px - iPhone 8</div>
                <div>414px - iPhone 11 Pro Max</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tablet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>768px - iPad</div>
                <div>1024px - iPad Pro</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Desktop</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>1280px - Desktop HD</div>
                <div>1920px - Desktop Full HD</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
