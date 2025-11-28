/**
 * Lazy-loaded component utilities for code splitting and bundle optimization
 * 
 * This module provides utilities for lazy loading non-critical components
 * to reduce initial bundle size and improve performance.
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Loading component for lazy-loaded components
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

/**
 * Lazy load a component with loading fallback
 */
export function lazyLoad<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> } | any>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: (options?.loading || LoadingFallback) as any,
    ssr: options?.ssr ?? true,
  });
}

/**
 * Lazy-loaded UI components (non-critical)
 */

// Enhanced Card - used in many places but not critical for initial render
export const LazyEnhancedCard = lazyLoad(
  () => import('@/components/ui/enhanced-card').then(mod => ({ default: mod.EnhancedCard })),
  { ssr: true }
);

// Build Card - only needed on specific pages
export const LazyBuildCard = lazyLoad(
  () => import('@/components/BuildCard').then(mod => ({ default: mod.BuildCard })),
  { ssr: false }
);

// Skeleton Loader - only needed during loading states
export const LazySkeletonLoader = lazyLoad(
  () => import('@/components/ui/skeleton-loader').then(mod => ({ default: mod.SkeletonLoader })),
  { ssr: false }
);

// Progress Indicator - only needed during progress states
export const LazyProgressIndicator = lazyLoad(
  () => import('@/components/ui/progress-indicator').then(mod => ({ default: mod.ProgressIndicator })),
  { ssr: false }
);

// Error State - only needed on errors
export const LazyErrorState = lazyLoad(
  () => import('@/components/ui/error-state').then(mod => ({ default: mod.ErrorState })),
  { ssr: false }
);

// Empty State - only needed when no content
export const LazyEmptyState = lazyLoad(
  () => import('@/components/ui/empty-state').then(mod => ({ default: mod.EmptyState })),
  { ssr: false }
);

// Mobile Menu - only needed on mobile
export const LazyMobileMenu = lazyLoad(
  () => import('@/components/layout/mobile-menu'),
  { ssr: false }
);

// Homepage components - can be lazy loaded as they're below the fold
export const LazyFeatureGrid = lazyLoad(
  () => import('@/components/homepage/feature-grid').then(mod => ({ default: mod.FeatureGrid })),
  { ssr: true }
);

export const LazyStatsSection = lazyLoad(
  () => import('@/components/homepage/stats-section').then(mod => ({ default: mod.StatsSection })),
  { ssr: true }
);

// Game Map - heavy component, lazy load
export const LazyGameMap = lazyLoad(
  () => import('@/components/GameMap'),
  { ssr: false }
);



/**
 * Preload a component for better UX
 * Call this when you know the user will need the component soon
 */
export function preloadComponent(
  importFunc: () => Promise<{ default: ComponentType<any> }>
) {
  // Trigger the import but don't wait for it
  importFunc().catch(() => {
    // Silently fail - component will be loaded when actually needed
  });
}

/**
 * Lazy load with intersection observer
 * Component only loads when it enters the viewport
 */
export function lazyLoadOnVisible<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    rootMargin?: string;
    threshold?: number;
  }
) {
  return dynamic(importFunc, {
    loading: LoadingFallback,
    ssr: false,
  });
}

/**
 * Conditional lazy loading based on feature flags or conditions
 */
export function conditionalLazyLoad<P extends object>(
  condition: boolean,
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ComponentType<P>
) {
  if (!condition && fallback) {
    return fallback;
  }

  return lazyLoad(importFunc, { ssr: false });
}
