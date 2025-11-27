'use client';

import React from 'react';
import { PageTransition, PageTransitionConfig } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Demo page for PageTransition configuration options
 * Shows all available configuration options and their effects
 */
export default function PageTransitionConfigDemo() {
  const [currentConfig, setCurrentConfig] = React.useState<PageTransitionConfig>({
    enableAnimation: true,
    fallbackDelay: 1000,
    duration: 0.4,
  });

  const [content, setContent] = React.useState(0);

  const presetConfigs: Array<{ name: string; config: PageTransitionConfig; description: string }> = [
    {
      name: 'Default',
      config: {
        enableAnimation: true,
        fallbackDelay: 1000,
        duration: 0.4,
      },
      description: 'Standard animation with 0.4s duration',
    },
    {
      name: 'Fast',
      config: {
        enableAnimation: true,
        fallbackDelay: 1000,
        duration: 0.2,
      },
      description: 'Quick animation with 0.2s duration',
    },
    {
      name: 'Slow',
      config: {
        enableAnimation: true,
        fallbackDelay: 1000,
        duration: 0.8,
      },
      description: 'Slower animation with 0.8s duration',
    },
    {
      name: 'No Animation',
      config: {
        enableAnimation: false,
      },
      description: 'Animations completely disabled',
    },
    {
      name: 'Long Fallback',
      config: {
        enableAnimation: true,
        fallbackDelay: 3000,
        duration: 0.4,
      },
      description: 'Extended fallback delay of 3 seconds',
    },
    {
      name: 'Custom Variants',
      config: {
        enableAnimation: true,
        fallbackDelay: 1000,
        variants: {
          initial: { opacity: 0, scale: 0.8 },
          enter: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.5, ease: 'easeOut' }
          },
          exit: { 
            opacity: 0, 
            scale: 1.2,
            transition: { duration: 0.3, ease: 'easeIn' }
          },
        },
      },
      description: 'Custom animation with scale effect',
    },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">PageTransition Configuration Demo</h1>
        <p className="text-muted-foreground">
          Test different configuration options for the PageTransition component
        </p>
      </div>

      {/* Configuration Presets */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Configuration Presets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presetConfigs.map((preset) => (
            <Card
              key={preset.name}
              className="p-4 space-y-2 cursor-pointer hover:border-primary transition-colors"
              onClick={() => setCurrentConfig(preset.config)}
            >
              <h3 className="font-semibold">{preset.name}</h3>
              <p className="text-sm text-muted-foreground">{preset.description}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentConfig(preset.config);
                }}
              >
                Apply
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      {/* Current Configuration Display */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Current Configuration</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{JSON.stringify(currentConfig, null, 2)}</code>
        </pre>
      </Card>

      {/* Test Area */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Test Animation</h2>
        <p className="text-muted-foreground">
          Click the button below to trigger a content change and see the animation in action
        </p>
        <Button
          onClick={() => setContent((prev) => prev + 1)}
          size="lg"
        >
          Change Content (Count: {content})
        </Button>

        {/* Animated Content */}
        <div className="mt-8">
          <PageTransition config={currentConfig}>
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold">Content #{content}</h3>
                <p className="text-lg">
                  This content animates based on the selected configuration.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm font-semibold">Animation Enabled</p>
                    <p className="text-2xl">{currentConfig.enableAnimation ? '✓' : '✗'}</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm font-semibold">Duration</p>
                    <p className="text-2xl">{currentConfig.duration || 'Default'}s</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm font-semibold">Fallback Delay</p>
                    <p className="text-2xl">{currentConfig.fallbackDelay || 'Default'}ms</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm font-semibold">Custom Variants</p>
                    <p className="text-2xl">{currentConfig.variants ? '✓' : '✗'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </PageTransition>
        </div>
      </Card>

      {/* Accessibility Info */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Accessibility Features</h2>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <div>
              <p className="font-semibold">Prefers Reduced Motion</p>
              <p className="text-sm text-muted-foreground">
                Automatically detects and respects user's motion preferences
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <div>
              <p className="font-semibold">Fallback Mechanism</p>
              <p className="text-sm text-muted-foreground">
                Ensures content always renders even if animations fail
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <div>
              <p className="font-semibold">Configurable Animations</p>
              <p className="text-sm text-muted-foreground">
                Can be completely disabled for better performance or accessibility
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Examples */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Usage Examples</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Basic Usage (Default)</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{`<PageTransition>
  {children}
</PageTransition>`}</code>
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">With Configuration</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{`<PageTransition config={{ 
  enableAnimation: true, 
  fallbackDelay: 1500,
  duration: 0.6 
}}>
  {children}
</PageTransition>`}</code>
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Disabled Animations</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{`<PageTransition config={{ enableAnimation: false }}>
  {children}
</PageTransition>`}</code>
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Custom Variants</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{`<PageTransition config={{ 
  variants: {
    initial: { opacity: 0, scale: 0.9 },
    enter: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 }
  }
}}>
  {children}
</PageTransition>`}</code>
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
