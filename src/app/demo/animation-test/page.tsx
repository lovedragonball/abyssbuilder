'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { runAnimationTests } from '@/lib/animation-test-utils';

export default function AnimationTestPage() {
  const [testResults, setTestResults] = useState<Awaited<
    ReturnType<typeof runAnimationTests>
  > | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await runAnimationTests();
      setTestResults(results);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Animation & Interaction Testing</h1>
          <p className="text-muted-foreground">
            Test animations and interactions for performance and responsiveness
          </p>
        </div>

        {/* Test Controls */}
        <div className="flex gap-4">
          <Button onClick={runTests} disabled={isRunning} size="lg">
            {isRunning ? 'Running Tests...' : 'Run Animation Tests'}
          </Button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Test Summary</h2>
              <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Frame Rate */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Frame Rate Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Average FPS</div>
                  <div
                    className={`text-2xl font-bold ${
                      testResults.frameRate.averageFPS >= 55
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {testResults.frameRate.averageFPS.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Min FPS</div>
                  <div className="text-2xl font-bold">
                    {testResults.frameRate.minFPS.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Max FPS</div>
                  <div className="text-2xl font-bold">
                    {testResults.frameRate.maxFPS.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Performance</div>
                  <div className="text-2xl font-bold capitalize">
                    {testResults.frameRate.performance}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Dropped frames: {testResults.frameRate.droppedFrames} /{' '}
                {testResults.frameRate.frames}
              </div>
            </div>

            {/* Interactions */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Interactive Elements</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Elements</div>
                    <div className="text-2xl font-bold">
                      {testResults.interactions.total}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tested</div>
                    <div className="text-2xl font-bold">
                      {testResults.interactions.tested}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Pass Rate</div>
                    <div className="text-2xl font-bold">
                      {(
                        (testResults.interactions.passed /
                          (testResults.interactions.passed +
                            testResults.interactions.failed)) *
                        100
                      ).toFixed(0)}
                      %
                    </div>
                  </div>
                </div>

                {testResults.interactions.results
                  .filter((r) => !r.passed)
                  .slice(0, 5).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="font-semibold text-red-500">Failed Tests:</div>
                    {testResults.interactions.results
                      .filter((r) => !r.passed)
                      .slice(0, 5)
                      .map((result, i) => (
                        <div key={i} className="text-sm text-muted-foreground">
                          • {result.element} ({result.interactionType}):{' '}
                          {result.issues.join(', ')}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Loading States */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Loading States</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="text-2xl font-bold">
                    {testResults.loadingStates.total}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Skeletons</div>
                  <div className="text-2xl font-bold">
                    {testResults.loadingStates.skeletonLoaders}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Progress Bars</div>
                  <div className="text-2xl font-bold">
                    {testResults.loadingStates.progressIndicators}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Spinners</div>
                  <div className="text-2xl font-bold">
                    {testResults.loadingStates.spinners}
                  </div>
                </div>
              </div>
            </div>

            {/* Page Transitions */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Page Transitions</h2>
              <div className="space-y-2">
                <div
                  className={`text-sm ${
                    testResults.pageTransitions.hasTransitions
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {testResults.pageTransitions.hasTransitions
                    ? 'Page transitions detected'
                    : 'No page transitions found'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Elements with transitions:{' '}
                  {testResults.pageTransitions.transitionElements}
                </div>
                {testResults.pageTransitions.transitionProperties.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-semibold">Transition Properties:</div>
                    <div className="text-sm text-muted-foreground">
                      {testResults.pageTransitions.transitionProperties.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Test Samples */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Test Samples</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Interactive elements to test hover and click states:
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default Button</Button>
              <Button variant="gradient">Gradient Button</Button>
              <Button variant="glass">Glass Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
