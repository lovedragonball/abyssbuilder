'use client';

import { useEffect, useRef, useState, ReactNode, ReactElement, cloneElement, isValidElement } from 'react';

interface StickyStatsHeaderProps {
  children: ReactNode | ((isScrolled: boolean) => ReactNode);
  threshold?: number; // pixels from top before becoming sticky
}

/**
 * StickyStatsHeader - A wrapper component that makes its children sticky at the top
 * of the viewport when scrolling. Applies backdrop blur and shadow when scrolled.
 * 
 * Requirements covered:
 * - 1.1: Stats Comparison section remains fixed at top when scrolling
 * - 1.2: Subtle background blur and shadow when sticky
 * - 1.3: Returns to normal position seamlessly when scrolling back to top
 * 
 * Supports two usage patterns:
 * 1. Render prop: <StickyStatsHeader>{(isScrolled) => <Child compact={isScrolled} />}</StickyStatsHeader>
 * 2. Direct children: <StickyStatsHeader><Child /></StickyStatsHeader> (will auto-inject compact prop)
 */
export function StickyStatsHeader({ children, threshold = 0 }: StickyStatsHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Use IntersectionObserver to detect when the sentinel element
    // leaves the viewport (meaning we've scrolled past the header)
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is not intersecting (scrolled out of view), header is "scrolled"
        setIsScrolled(!entry.isIntersecting);
      },
      {
        // Root margin creates a buffer zone at the top
        rootMargin: `-${threshold}px 0px 0px 0px`,
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  // Support render prop pattern for passing isScrolled state
  const renderChildren = () => {
    if (typeof children === 'function') {
      return children(isScrolled);
    }
    
    // Auto-inject compact prop to direct children if they accept it
    if (isValidElement(children)) {
      return cloneElement(children as ReactElement<{ compact?: boolean }>, { compact: isScrolled });
    }
    
    return children;
  };

  return (
    <>
      {/* Sentinel element - when this scrolls out of view, we know the header is sticky */}
      <div ref={sentinelRef} className="h-0 w-full" aria-hidden="true" />
      
      {/* Sticky container */}
      <div
        className={`
          sticky top-0 z-40
          transition-all duration-200 ease-out
          ${isScrolled 
            ? 'backdrop-blur-xl bg-[#1a1a1f]/95 shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-b border-white/10 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 px-4 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-3' 
            : 'bg-transparent'
          }
        `}
      >
        {renderChildren()}
      </div>
    </>
  );
}

export default StickyStatsHeader;
