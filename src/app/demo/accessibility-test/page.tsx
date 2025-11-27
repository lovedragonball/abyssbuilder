'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { runAllAccessibilityChecks, type AccessibilityTestResults } from '@/lib/accessibility-test';

export default function AccessibilityTestPage() {
  const [testResults, setTestResults] = useState<AccessibilityTestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runAllAccessibilityChecks();
      setTestResults(results);
      setIsRunning(false);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Accessibility Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive WCAG 2.1 compliance and accessibility testing
          </p>
        </div>

        {/* Test Controls */}
        <div className="flex gap-4">
          <Button onClick={runTests} disabled={isRunning} size="lg">
            {isRunning ? 'Running Tests...' : 'Run Accessibility Tests'}
          </Button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Test Summary</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <div className="text-3xl font-bold text-blue-500">
                    {testResults.summary.totalTests}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Tests</div>
                </div>
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
              </div>
              {testResults.summary.warnings > 0 && (
                <div className="mt-4 text-center p-4 bg-yellow-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-500">
                    {testResults.summary.warnings}
                  </div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
              )}
            </div>

            {/* Color Contrast */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Color Contrast (WCAG 2.1)</h2>
              <div className="space-y-3">
                {testResults.colorContrast.map((result, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border ${
                      result.passes
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Ratio: {result.ratio}:1 • Level: {result.wcagLevel}
                        </div>
                      </div>
                      <div className="text-2xl">
                        {result.passes ? '✅' : '❌'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {testResults.colorContrast.filter((r) => r.passes).length} /{' '}
                {testResults.colorContrast.length} combinations pass WCAG AA
              </div>
            </div>

            {/* Keyboard Navigation */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Keyboard Navigation</h2>
              <div className="space-y-4">
                <div
                  className={`text-lg font-medium ${
                    testResults.keyboardNavigation.passed
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {testResults.keyboardNavigation.passed
                    ? '✅ All keyboard navigation checks passed'
                    : '❌ Keyboard navigation issues found'}
                </div>

                {testResults.keyboardNavigation.issues.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold text-red-500">Issues:</div>
                    {testResults.keyboardNavigation.issues.map((issue, i) => (
                      <div key={i} className="text-sm text-muted-foreground">
                        • {issue}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <div className="font-semibold mb-2">Tab Order Preview:</div>
                  <div className="text-sm text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                    {testResults.keyboardNavigation.tabOrder.slice(0, 10).map((item, i) => (
                      <div key={i}>{item}</div>
                    ))}
                    {testResults.keyboardNavigation.tabOrder.length > 10 && (
                      <div className="italic">
                        ... and {testResults.keyboardNavigation.tabOrder.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ARIA Attributes */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">ARIA Attributes</h2>
              <div className="space-y-4">
                <div
                  className={`text-lg font-medium ${
                    testResults.ariaAttributes.passed
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {testResults.ariaAttributes.passed
                    ? '✅ All ARIA attributes are valid'
                    : '❌ ARIA issues found'}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">With Role</div>
                    <div className="text-2xl font-bold">
                      {testResults.ariaAttributes.stats.elementsWithRole}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">With aria-label</div>
                    <div className="text-2xl font-bold">
                      {testResults.ariaAttributes.stats.elementsWithAriaLabel}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">With aria-describedby</div>
                    <div className="text-2xl font-bold">
                      {testResults.ariaAttributes.stats.elementsWithAriaDescribedBy}
                    </div>
                  </div>
                </div>

                {testResults.ariaAttributes.issues.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold text-red-500">Issues:</div>
                    {testResults.ariaAttributes.issues.map((issue, i) => (
                      <div key={i} className="text-sm text-muted-foreground">
                        • {issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Heading Hierarchy */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Heading Hierarchy</h2>
              <div className="space-y-4">
                <div
                  className={`text-lg font-medium ${
                    testResults.headingHierarchy.passed
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {testResults.headingHierarchy.passed
                    ? '✅ Heading hierarchy is correct'
                    : '❌ Heading hierarchy issues found'}
                </div>

                {testResults.headingHierarchy.issues.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold text-red-500">Issues:</div>
                    {testResults.headingHierarchy.issues.map((issue, i) => (
                      <div key={i} className="text-sm text-muted-foreground">
                        • {issue}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <div className="font-semibold mb-2">Heading Structure:</div>
                  <div className="text-sm text-muted-foreground space-y-1 max-h-40 overflow-y-auto font-mono">
                    {testResults.headingHierarchy.hierarchy.map((item, i) => (
                      <div key={i}>{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Landmarks */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Landmark Regions</h2>
              <div className="space-y-4">
                <div
                  className={`text-lg font-medium ${
                    testResults.landmarks.passed ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {testResults.landmarks.passed
                    ? '✅ Landmark regions are correct'
                    : '❌ Landmark issues found'}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Main</div>
                    <div className="text-2xl font-bold">
                      {testResults.landmarks.landmarks.main}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Nav</div>
                    <div className="text-2xl font-bold">
                      {testResults.landmarks.landmarks.nav}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Header</div>
                    <div className="text-2xl font-bold">
                      {testResults.landmarks.landmarks.header}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Footer</div>
                    <div className="text-2xl font-bold">
                      {testResults.landmarks.landmarks.footer}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Aside</div>
                    <div className="text-2xl font-bold">
                      {testResults.landmarks.landmarks.aside}
                    </div>
                  </div>
                </div>

                {testResults.landmarks.issues.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold text-red-500">Issues:</div>
                    {testResults.landmarks.issues.map((issue, i) => (
                      <div key={i} className="text-sm text-muted-foreground">
                        • {issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Focus Indicators & Other Checks */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Focus Indicators</h2>
                <div
                  className={`text-lg font-medium ${
                    testResults.focusIndicators ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {testResults.focusIndicators
                    ? '✅ All elements have focus indicators'
                    : '❌ Some elements missing focus indicators'}
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Image Alt Text</h2>
                <div
                  className={`text-lg font-medium ${
                    testResults.imageAltText ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {testResults.imageAltText
                    ? '✅ All images have alt text'
                    : '❌ Some images missing alt text'}
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Form Labels</h2>
                <div
                  className={`text-lg font-medium ${
                    testResults.formLabels ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {testResults.formLabels
                    ? '✅ All form inputs have labels'
                    : '❌ Some inputs missing labels'}
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Reduced Motion</h2>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    User Preference:{' '}
                    <span className="font-medium">
                      {testResults.reducedMotion.prefersReducedMotion
                        ? 'Reduced'
                        : 'No preference'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Animated Elements: {testResults.reducedMotion.animatedElements}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Testing Instructions */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Manual Testing Checklist</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">⌨️</span>
              <div>
                <strong>Keyboard Navigation:</strong> Try navigating the page using only Tab,
                Shift+Tab, Enter, and Arrow keys
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">🔊</span>
              <div>
                <strong>Screen Reader:</strong> Test with NVDA (Windows), JAWS (Windows), or
                VoiceOver (Mac)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">🔍</span>
              <div>
                <strong>Zoom:</strong> Test at 200% zoom level to ensure content remains
                accessible
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">🎨</span>
              <div>
                <strong>Color Blindness:</strong> Use browser extensions to simulate different
                types of color blindness
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
