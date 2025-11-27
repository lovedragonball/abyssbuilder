/**
 * Performance-optimized animation hooks
 */

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, applyWillChange, createScrollObserver } from '@/lib/animation-performance';

/**
 * Hook to detect if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return reducedMotion;
}

/**
 * Hook to manage will-change property for performance
 */
export function useWillChange<T extends HTMLElement>(
  properties: string[],
  enabled: boolean = true
) {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (!enabled || reducedMotion || !ref.current) return;
    
    applyWillChange(ref.current, properties);
  }, [properties, enabled, reducedMotion]);
  
  return ref;
}

/**
 * Hook for scroll-triggered animations with Intersection Observer
 */
export function useScrollAnimation<T extends HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (!ref.current) return;
    
    // If reduced motion, show immediately
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }
    
    const observer = createScrollObserver(
      (entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer?.unobserve(entry.target);
        }
      },
      options
    );
    
    if (observer && ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (observer && ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [reducedMotion, options]);
  
  return { ref, isVisible };
}

/**
 * Hook for staggered animations
 */
export function useStaggerAnimation(
  itemCount: number,
  staggerDelay: number = 100
) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const reducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (reducedMotion) {
      // Show all items immediately if reduced motion
      setVisibleItems(Array.from({ length: itemCount }, (_, i) => i));
      return;
    }
    
    const timeouts: NodeJS.Timeout[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setVisibleItems((prev) => [...prev, i]);
      }, i * staggerDelay);
      
      timeouts.push(timeout);
    }
    
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [itemCount, staggerDelay, reducedMotion]);
  
  return visibleItems;
}

/**
 * Hook for managing animation state with performance
 */
export function useAnimationState(initialState: boolean = false) {
  const [isAnimating, setIsAnimating] = useState(initialState);
  const reducedMotion = useReducedMotion();
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const startAnimation = (duration: number = 300) => {
    if (reducedMotion) {
      // Skip animation if reduced motion
      return;
    }
    
    setIsAnimating(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  };
  
  const stopAnimation = () => {
    setIsAnimating(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return { isAnimating, startAnimation, stopAnimation };
}

/**
 * Hook for parallax effect with performance optimization
 */
export function useParallax<T extends HTMLElement>(
  speed: number = 0.5,
  enabled: boolean = true
) {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (!enabled || reducedMotion || !ref.current) return;
    
    const element = ref.current;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (element) {
            const scrolled = window.pageYOffset;
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, enabled, reducedMotion]);
  
  return ref;
}

/**
 * Hook for hover animation with will-change optimization
 */
export function useHoverAnimation<T extends HTMLElement>(
  properties: string[] = ['transform']
) {
  const ref = useRef<T>(null);
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (!ref.current || reducedMotion) return;
    
    const element = ref.current;
    
    const handleMouseEnter = () => {
      setIsHovered(true);
      if (!reducedMotion) {
        applyWillChange(element, properties);
      }
    };
    
    const handleMouseLeave = () => {
      setIsHovered(false);
      element.style.willChange = 'auto';
    };
    
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [properties, reducedMotion]);
  
  return { ref, isHovered };
}
