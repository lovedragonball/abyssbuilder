/**
 * Caching utilities for patch data with localStorage
 * Implements 1-hour expiration for cached data
 */

import { PatchData } from './patch-data';

const CACHE_KEY = 'patch-data-cache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

export interface CachedData {
  data: PatchData;
  timestamp: number;
}

/**
 * Get cached patch data from localStorage
 * @returns Cached PatchData if valid, null if expired or not found
 */
export function getCachedPatchData(): PatchData | null {
  if (typeof window === 'undefined') {
    return null; // Server-side, no localStorage
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return null;
    }

    const { data, timestamp }: CachedData = JSON.parse(cached);
    
    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to read cached patch data:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

/**
 * Save patch data to localStorage cache
 * @param data - PatchData to cache
 */
export function setCachedPatchData(data: PatchData): void {
  if (typeof window === 'undefined') {
    return; // Server-side, no localStorage
  }

  try {
    const cachedData: CachedData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
  } catch (error) {
    console.error('Failed to cache patch data:', error);
    // Silently fail - caching is not critical
  }
}

/**
 * Clear cached patch data
 */
export function clearCachedPatchData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear cached patch data:', error);
  }
}

/**
 * Get cache age in milliseconds
 * @returns Age of cache in ms, or null if no cache exists
 */
export function getCacheAge(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return null;
    }

    const { timestamp }: CachedData = JSON.parse(cached);
    return Date.now() - timestamp;
  } catch (error) {
    return null;
  }
}

/**
 * Check if cache is valid (exists and not expired)
 * @returns true if cache is valid, false otherwise
 */
export function isCacheValid(): boolean {
  const age = getCacheAge();
  return age !== null && age < CACHE_DURATION;
}
