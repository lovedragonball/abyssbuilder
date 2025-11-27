'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { runAllAccessibilityChecks, testColorContrast, defaultColorTests } from '@/lib/accessibility-test';
import { Check, X, Info } from 'lucide-react';

export default function AccessibilityDemoPage() {
  const [testResults, setTestResults] = useState<any>(null);

  const runTests = () => {
    const results = runAllAccessibilityChecks();
    setTestResults(results);
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold gradient-text">
          Accessibility Features Demo
        </h1>
        <p className="text-lg text-muted-foreground">
          This page demonstrates the accessibility features implemented in AbyssBuilder
          to ensure WCAG 2.1 Level AA compliance.
        </p>
      </div>

      {/* Focus Indicators Section */}
      <EnhancedCard variant="elevated" className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          1. Focus Indicators
        </h2>
        <p className="text-muted-foreground">
          All interactive elements have visible focus indicators. Try pressing Tab to navigate through these elements:
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default Button</Button>
          <Button variant="gradient">Gradient Button</Button>
          <Button variant="glass">Glass Button</Button>
          <Button variant="outline">Outline Button</Button>
          <a href="#" className="text-primary hover:underline">
            Example Link
          </a>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <Info className="inline w-4 h-4 mr-2" />
            Focus indicators use a 3px solid outline with a 4px shadow for maximum visibility.
          </p>
        </div>
      </EnhancedCard>

      {/* Keyboard Shortcuts Section */}
      <EnhancedCard variant="elevated" className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          2. Keyboard Shortcuts
        </h2>
        <p className="text-muted-foreground">
          The following keyboard shortcuts are available throughout the application:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <kbd className="px-2 py-1 bg-background border border-border rounded text-sm font-mono">
              Ctrl + N
            </kbd>
            <span className="ml-3 text-muted-foreground">Create new build</span>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <kbd className="px-2 py-1 bg-background border border-border rounded text-sm font-mono">
              Ctrl + B
            </kbd>
            <span className="ml-3 text-muted-foreground">View my builds</span>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <kbd className="px-2 py-1 bg-background border border-border rounded text-sm font-mono">
              Ctrl + T
            </kbd>
            <span className="ml-3 text-muted-foreground">View tier list</span>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <kbd className="px-2 py-1 bg-background border border-border rounded text-sm font-mono">
              Ctrl + M
            </kbd>
            <span className="ml-3 text-muted-foreground">View interactive map</span>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <kbd className="px-2 py-1 bg-background border border-border rounded text-sm font-mono">
              Escape
            </kbd>
            <span className="ml-3 text-muted-foreground">Close modals/menus</span>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <kbd className="px-2 py-1 bg-background border border-border rounded text-sm font-mono">
              Tab
            </kbd>
            <span className="ml-3 text-muted-foreground">Navigate forward</span>
          </div>
        </div>
      </EnhancedCard>

      {/* Color Contrast Section */}
      <EnhancedCard variant="elevated" className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          3. Color Contrast Testing
        </h2>
        <p className="text-muted-foreground">
          All color combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).
        </p>
        <Button onClick={runTests} variant="gradient">
          Run Accessibility Tests
        </Button>

        {testResults && (
          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold">Test Results</h3>
            <div className="space-y-2">
              {testResults.colorContrast.map((result: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-muted/50 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Ratio: {result.ratio}:1 | Level: {result.wcagLevel}
                    </div>
                  </div>
                  <div>
                    {result.passes ? (
                      <Check className="w-6 h-6 text-green-500" />
                    ) : (
                      <X className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {testResults.focusIndicators ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">Focus Indicators</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {testResults.focusIndicators
                    ? 'All elements have proper focus indicators'
                    : 'Some elements missing focus indicators'}
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {testResults.imageAltText ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">Image Alt Text</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {testResults.imageAltText
                    ? 'All images have alt text'
                    : 'Some images missing alt text'}
                </p>
              </div>
            </div>
          </div>
        )}
      </EnhancedCard>

      {/* Touch Targets Section */}
      <EnhancedCard variant="elevated" className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          4. Touch Target Sizes
        </h2>
        <p className="text-muted-foreground">
          All interactive elements meet minimum touch target sizes (44x44px) for better mobile accessibility.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button size="default">Default (44px)</Button>
          <Button size="sm">Small (36px)</Button>
          <Button size="lg">Large (48px)</Button>
          <Button size="icon">Icon (44px)</Button>
        </div>
      </EnhancedCard>

      {/* Skip Link Section */}
      <EnhancedCard variant="elevated" className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          5. Skip to Main Content
        </h2>
        <p className="text-muted-foreground">
          A "Skip to main content" link is available at the top of every page for keyboard users.
          Press Tab when the page loads to see it.
        </p>
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <Info className="inline w-4 h-4 mr-2" />
            The skip link is visually hidden but becomes visible when focused, allowing keyboard
            users to bypass navigation and jump directly to the main content.
          </p>
        </div>
      </EnhancedCard>

      {/* Reduced Motion Section */}
      <EnhancedCard variant="elevated" className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          6. Reduced Motion Support
        </h2>
        <p className="text-muted-foreground">
          The application respects the user's motion preferences. If you have "Reduce motion"
          enabled in your system settings, animations will be minimized.
        </p>
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <Info className="inline w-4 h-4 mr-2" />
            To test this, enable "Reduce motion" in your operating system's accessibility settings.
          </p>
        </div>
      </EnhancedCard>

      {/* Resources Section */}
      <EnhancedCard variant="elevated" className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          Resources
        </h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>
            <a
              href="https://www.w3.org/WAI/WCAG21/quickref/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              WCAG 2.1 Guidelines
            </a>
          </li>
          <li>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/Accessibility"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              MDN Accessibility Documentation
            </a>
          </li>
          <li>
            <a
              href="https://webaim.org/resources/contrastchecker/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              WebAIM Contrast Checker
            </a>
          </li>
          <li>
            <a
              href="https://www.a11yproject.com/checklist/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              A11y Project Checklist
            </a>
          </li>
        </ul>
      </EnhancedCard>
    </div>
  );
}
