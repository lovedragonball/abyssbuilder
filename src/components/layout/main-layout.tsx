'use client';

import React from 'react';
import Header from './header';
import { NavigationProgress } from '@/components/navigation-progress';
import { PageTransition, PageTransitionConfig } from '@/components/page-transition';
import SafePageTransition from '@/components/safe-page-transition';
import { usePathname } from 'next/navigation';

/**
 * Configuration for page transitions
 * Can be customized based on user preferences or application needs
 */
const PAGE_TRANSITION_CONFIG: PageTransitionConfig = {
  enableAnimation: true,
  fallbackDelay: 1000,
  duration: 0.4,
};

/**
 * MainLayout Component
 * 
 * Main layout wrapper for all pages with:
 * - Header with navigation
 * - Navigation progress indicator
 * - Safe page transitions with error boundary
 * - Optional loading indicator
 * 
 * Features:
 * - Error boundary for animation failures
 * - Configurable page transitions
 * - Loading state tracking
 * - Accessibility support
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Global live region for navigation announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Navigation progress bar */}
      <NavigationProgress />
      
      {/* Header with navigation - always visible */}
      <Header />
      
      {/* Optional loading indicator */}
      {isLoading && (
        <div 
          className="fixed top-16 left-0 right-0 h-1 bg-primary/20 z-50"
          role="progressbar"
          aria-label="Page loading"
          aria-busy="true"
        >
          <div className="h-full bg-primary animate-pulse" />
        </div>
      )}
      
      {/* Safe page transition wrapper with error boundary */}
      <SafePageTransition
        fallback={
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
        }
      >
        <PageTransition config={PAGE_TRANSITION_CONFIG}>
          <main id="main-content" className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </PageTransition>
      </SafePageTransition>
    </div>
  );
}
