/**
 * Animation Performance Utilities
 * 
 * This module provides utilities for optimizing animations and respecting
 * user preferences for reduced motion.
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration based on user preferences
 * Returns minimal duration if reduced motion is preferred
 */
export function getAnimationDuration(normalDuration: number): number {
  return prefersReducedMotion() ? 1 : normalDuration;
}

/**
 * Animation configuration with performance optimizations
 */
export const animationConfig = {
  // Fast animations (150ms)
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1], // ease-in-out
  },
  // Normal animations (300ms)
  normal: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
  // Slow animations (500ms)
  slow: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1],
  },
  // Spring animations
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
  // Gentle spring
  springGentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
  },
};

/**
 * Get animation config with reduced motion support
 */
export function getAnimationConfig(config: typeof animationConfig.normal) {
  if (prefersReducedMotion()) {
    return {
      duration: 0.01,
      ease: [0, 0, 1, 1],
    };
  }
  return config;
}

/**
 * Framer Motion variants with performance optimizations
 */
export const performanceVariants = {
  // Fade in/out
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: animationConfig.normal,
  },
  
  // Fade in from bottom
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: animationConfig.normal,
  },
  
  // Fade in from top
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: animationConfig.normal,
  },
  
  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: animationConfig.fast,
  },
  
  // Slide in from right
  slideInRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: animationConfig.normal,
  },
  
  // Slide in from left
  slideInLeft: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: animationConfig.normal,
  },
};

/**
 * Stagger children animation
 */
export function getStaggerConfig(staggerDelay: number = 0.1) {
  if (prefersReducedMotion()) {
    return {
      staggerChildren: 0,
      delayChildren: 0,
    };
  }
  
  return {
    staggerChildren: staggerDelay,
    delayChildren: 0.1,
  };
}

/**
 * Apply will-change property for heavy animations
 * Automatically removes it after animation completes
 */
export function applyWillChange(element: HTMLElement, properties: string[]) {
  if (!element || prefersReducedMotion()) return;
  
  element.style.willChange = properties.join(', ');
  
  // Remove will-change after animation completes
  const removeWillChange = () => {
    element.style.willChange = 'auto';
    element.removeEventListener('animationend', removeWillChange);
    element.removeEventListener('transitionend', removeWillChange);
  };
  
  element.addEventListener('animationend', removeWillChange);
  element.addEventListener('transitionend', removeWillChange);
  
  // Fallback: remove after 1 second
  setTimeout(removeWillChange, 1000);
}

/**
 * Hook for managing will-change on component mount/unmount
 */
export function useWillChange(ref: React.RefObject<HTMLElement>, properties: string[]) {
  if (typeof window === 'undefined') return;
  
  const element = ref.current;
  if (!element || prefersReducedMotion()) return;
  
  applyWillChange(element, properties);
}

/**
 * Check if animations should be enabled
 */
export function shouldAnimate(): boolean {
  return !prefersReducedMotion();
}

/**
 * Get transition class based on reduced motion preference
 */
export function getTransitionClass(normalClass: string, reducedClass: string = ''): string {
  return prefersReducedMotion() ? reducedClass : normalClass;
}

/**
 * Performance-optimized scroll animation
 */
export function smoothScrollTo(element: HTMLElement | null, offset: number = 0) {
  if (!element) return;
  
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  
  if (prefersReducedMotion()) {
    window.scrollTo(0, targetPosition);
    return;
  }
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
}

/**
 * Intersection Observer for scroll animations
 */
export function createScrollObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  if (typeof window === 'undefined') return null;
  
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
    ...options,
  };
  
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
}
