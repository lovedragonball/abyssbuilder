"use client"

import * as React from "react"
import { motion, AnimatePresence, Variants, MotionConfig } from "framer-motion"
import { usePathname } from "next/navigation"

/**
 * Configuration options for PageTransition component
 */
export interface PageTransitionConfig {
  /** Enable or disable animations (default: true) */
  enableAnimation?: boolean
  /** Fallback delay in milliseconds before forcing render (default: 800) */
  fallbackDelay?: number
  /** Animation duration in seconds (default: 0.3) - optimized for 60fps */
  duration?: number
  /** Custom animation variants (optional) */
  variants?: Variants
  /** Enable focus management after transition (default: true) */
  manageFocus?: boolean
  /** Enable screen reader announcements (default: true) */
  announcePageChange?: boolean
}

/**
 * Props for PageTransition component
 */
export interface PageTransitionProps {
  children: React.ReactNode
  /** Configuration options for animations and behavior */
  config?: PageTransitionConfig
}

/**
 * Optimized animation variants with smooth easing for 60fps performance
 * Uses only GPU-accelerated properties (opacity, transform)
 * Reduced duration for snappier feel
 */
const optimizedPageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10, // Reduced from 20 for faster animation
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3, // Reduced from 0.4 for better performance
      ease: [0.25, 0.1, 0.25, 1], // Optimized easing curve
    },
  },
  exit: {
    opacity: 0,
    y: -10, // Reduced from -20
    transition: {
      duration: 0.2, // Faster exit
      ease: [0.4, 0, 1, 1],
    },
  },
}

/**
 * Reduced motion variants for accessibility
 * Minimal animation for users who prefer reduced motion
 */
const reducedMotionVariants: Variants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.15, // Reduced from 0.2
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1, // Reduced from 0.15
    },
  },
}

/**
 * Memoized announcement component to prevent unnecessary re-renders
 */
const ScreenReaderAnnouncement = React.memo(({ announcement }: { announcement: string }) => (
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    className="sr-only"
  >
    {announcement}
  </div>
))
ScreenReaderAnnouncement.displayName = 'ScreenReaderAnnouncement'

/**
 * Optimized PageTransition component with performance enhancements
 * 
 * Performance Optimizations:
 * - Reduced animation duration (0.3s instead of 0.4s)
 * - Optimized easing curves for smoother 60fps animations
 * - Memoized callbacks and values to prevent unnecessary re-renders
 * - Reduced fallback delay (800ms instead of 1000ms)
 * - Smaller transform values for faster GPU processing
 * - MotionConfig for global performance settings
 * - Memoized components to prevent re-renders
 * 
 * Features:
 * - Configurable animation enable/disable
 * - Respects prefers-reduced-motion
 * - Fallback timeout mechanism
 * - Custom animation variants support
 * - Focus management for accessibility
 * - Screen reader announcements
 * - TypeScript type safety
 * 
 * @example
 * ```tsx
 * <PageTransition config={{ enableAnimation: true, fallbackDelay: 800 }}>
 *   {children}
 * </PageTransition>
 * ```
 */
export const PageTransition = React.memo(function PageTransition({ 
  children, 
  config = {} 
}: PageTransitionProps) {
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = React.useState(true)
  const [announcement, setAnnouncement] = React.useState("")
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const previousPathnameRef = React.useRef<string>(pathname)

  // Extract configuration with optimized defaults
  const {
    enableAnimation = true,
    fallbackDelay = 800, // Reduced from 1000ms
    duration = 0.3, // Reduced from 0.4s for better performance
    variants: customVariants,
    manageFocus = true,
    announcePageChange = true,
  } = config

  // Detect user's motion preference - memoized
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Determine which variants to use - memoized
  const activeVariants = React.useMemo(() => {
    if (customVariants) return customVariants
    if (prefersReducedMotion) return reducedMotionVariants
    
    // Apply custom duration if provided
    if (duration !== 0.3) {
      return {
        initial: optimizedPageVariants.initial,
        enter: {
          ...optimizedPageVariants.enter,
          transition: {
            ...(optimizedPageVariants.enter as any).transition,
            duration,
          },
        },
        exit: {
          ...optimizedPageVariants.exit,
          transition: {
            ...(optimizedPageVariants.exit as any).transition,
            duration: duration * 0.67, // Exit slightly faster
          },
        },
      }
    }
    
    return optimizedPageVariants
  }, [customVariants, prefersReducedMotion, duration])

  // Determine if animations should be active - memoized
  const shouldAnimate = React.useMemo(
    () => enableAnimation && !prefersReducedMotion,
    [enableAnimation, prefersReducedMotion]
  )

  // Generate page title from pathname for announcements - memoized callback
  const getPageTitle = React.useCallback((path: string): string => {
    const segments = path.split('/').filter(Boolean)
    if (segments.length === 0) return 'Home'
    
    // Convert kebab-case to Title Case
    const lastSegment = segments[segments.length - 1]
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }, [])

  // Handle focus management after page transition - memoized callback
  const manageFocusAfterTransition = React.useCallback(() => {
    if (!manageFocus || typeof window === 'undefined') return

    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      const mainContent = containerRef.current?.querySelector('main, [role="main"], #main-content')
      if (mainContent instanceof HTMLElement) {
        if (!mainContent.hasAttribute('tabindex')) {
          mainContent.setAttribute('tabindex', '-1')
        }
        mainContent.focus({ preventScroll: true })
      } else if (containerRef.current) {
        containerRef.current.focus({ preventScroll: true })
      }
    })
  }, [manageFocus])

  // Handle animation completion - memoized callback
  const handleAnimationComplete = React.useCallback(() => {
    // Clear timeout since animation completed successfully
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Manage focus after animation completes
    manageFocusAfterTransition()
  }, [manageFocusAfterTransition])

  // Pathname change effect
  React.useEffect(() => {
    setShouldRender(true)

    // Announce page change to screen readers
    if (announcePageChange && pathname !== previousPathnameRef.current) {
      const pageTitle = getPageTitle(pathname)
      setAnnouncement(`Navigated to ${pageTitle} page`)
      
      // Clear announcement after a short delay
      const announcementTimer = setTimeout(() => setAnnouncement(""), 1000)
      
      previousPathnameRef.current = pathname
      
      return () => clearTimeout(announcementTimer)
    }

    previousPathnameRef.current = pathname

    // Fallback timeout mechanism - force render if animation hangs
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setShouldRender(true)
      if (!shouldAnimate) {
        manageFocusAfterTransition()
      }
    }, fallbackDelay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pathname, shouldAnimate, fallbackDelay, announcePageChange, getPageTitle, manageFocusAfterTransition])

  // If animations are disabled, render without AnimatePresence
  if (!shouldAnimate) {
    return (
      <>
        <ScreenReaderAnnouncement announcement={announcement} />
        <div 
          key={pathname} 
          ref={containerRef}
          tabIndex={-1}
          style={{ outline: 'none' }}
        >
          {children}
        </div>
      </>
    )
  }

  // Error handling wrapper
  try {
    return (
      <>
        <ScreenReaderAnnouncement announcement={announcement} />
        
        {/* MotionConfig for global performance settings */}
        <MotionConfig reducedMotion="user">
          <AnimatePresence 
            mode="wait" 
            initial={true}
          >
            <motion.div
              key={pathname}
              ref={containerRef}
              variants={activeVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              tabIndex={-1}
              style={{ 
                outline: 'none',
                // Force GPU acceleration
                willChange: 'opacity, transform',
              }}
              onAnimationComplete={handleAnimationComplete}
            >
              {shouldRender && children}
            </motion.div>
          </AnimatePresence>
        </MotionConfig>
      </>
    )
  } catch (error) {
    console.error('[PageTransition] Error during animation:', error)
    // Fallback: render children without animation
    return (
      <>
        <ScreenReaderAnnouncement announcement={announcement} />
        <div 
          key={pathname}
          ref={containerRef}
          tabIndex={-1}
          style={{ outline: 'none' }}
        >
          {children}
        </div>
      </>
    )
  }
})

PageTransition.displayName = 'PageTransition'
