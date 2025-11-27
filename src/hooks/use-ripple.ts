"use client"

import { useState, useRef, useCallback } from 'react';

export interface Ripple {
  x: number;
  y: number;
  id: number;
}

export interface UseRippleReturn {
  ripples: Ripple[];
  createRipple: (event: React.MouseEvent<HTMLElement>) => void;
}

/**
 * Custom hook for creating ripple effects on click
 * @param duration - Duration of the ripple animation in milliseconds (default: 600)
 * @returns Object containing ripples array and createRipple function
 */
export function useRipple(duration: number = 600): UseRippleReturn {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleIdRef = useRef(0);

  const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple: Ripple = { 
      x, 
      y, 
      id: rippleIdRef.current++ 
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, duration);
  }, [duration]);

  return { ripples, createRipple };
}
