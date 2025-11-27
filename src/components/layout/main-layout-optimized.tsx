'use client';

import React from 'react';
import Header from './header';
import { NavigationProgress } from '@/components/navigation-progress';
import { PageTransition, PageTransitionConfig } from '@/components/page-transition-optimized';
import SafePageTransitionOptimized from '@/components/safe-page-transition-optimized';
import { usePathname } from 'next/navigation';

/**
 * Optimized configuration for page transitions
 * Tuned for 60fps performance with reduced durations
 */
const OPTIMIZED_PAGE_TRANSITION_CONFIG: PageTransitionConfig = {
  enableAnimation: true,
  fallbackDelay: 800, // Reduced from 1000ms
  duration: 0.3, // Reduced from 0.4s for better performance
};

/**
 * Memoized loading indicator to prevent unnecessary re-renders
 */
const LoadingIndicator = React.memo(() => (
  <div 
    className="fixed top-16 left-0 right-0 h-1 bg-primary/20 z-50"
    role="progressbar"
    aria-label="Page loading"
    aria-busy="true"
  >
    <div className="h-full bg-primary animate-pulse" />
  </div>
))
LoadingIndicator.displayName = 'LoadingIndicator'

/**
 * Memoized fallback content for error states
 */
const TransitionErrorFallback = React.memo(({ children }: { children: React.ReactNode }) => (
  <main id="main-content" className="p-4 sm:p-6 lg:p-8">
    <div className="max-w-4xl mx-auto">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          Page Transition Disabled
        </h2>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Page transitions have been disabled due to an error. Content will load without animations.
        </p>
      </div>
      <div className="mt-6">
        {children}
      </div>
    </div>
  </main>
))
TransitionErrorFallback.displayName = 'TransitionErrorFallback'

/**
 * Optimized MainLayout Component
 * 
 * Main layout wrapper for all pages with performance optimizations:
 * - React.memo to prevent unnecessary re-renders
 * - Memoized child components
 * - Optimized page transition configuration
 * - Efficient loading state management
 * 
 * Features:
 * - Header with navigation
 * - Navigation progress indicator
 * - Safe page transitions with error boundary
 * - Optional loading indicator
 * - Error boundary for animation failures
 * - Configurable page transitions
 * - Accessibility support
 */
const MainLayoutOptimized = React.memo(function MainLayoutOptimized({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = React.useState(false);

  // Track loading state during page transitions
  React.useEffect(() => {
    setIsLoading(true);
    
    // Reset loading state after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Memoize fallback content
  const fallbackContent = React.useMemo(
    () => <TransitionErrorFallback>{children}</TransitionErrorFallback>,
    [children]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation progress bar */}
      <NavigationProgress />
      
      {/* Header with navigation - always visible */}
      <Header />
      
      {/* Optional loading indicator */}
      {isLoading && <LoadingIndicator />}
      
      {/* Safe page transition wrapper with error boundary */}
      <SafePageTransitionOptimized fallback={fallbackContent}>
        <PageTransition config={OPTIMIZED_PAGE_TRANSITION_CONFIG}>
          <main id="main-content" className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </PageTransition>
      </SafePageTransitionOptimized>
    </div>
  );
})

MainLayoutOptimized.displayName = 'MainLayoutOptimized'

export default MainLayoutOptimized;
