/**
 * Hook for loading and caching patch data
 * Implements automatic caching with localStorage
 */

"use client"

import { useState, useEffect, useCallback } from 'react';
import { PatchData } from '@/lib/patch-data';
import { PatchParser } from '@/lib/patch-parser';
import { 
  getCachedPatchData, 
  setCachedPatchData, 
  clearCachedPatchData 
} from '@/lib/patch-cache';

export interface UsePatchDataOptions {
  /** Whether to use caching (default: true) */
  useCache?: boolean;
  /** Whether to fetch data immediately (default: true) */
  immediate?: boolean;
  /** Callback when data is loaded */
  onLoad?: (data: PatchData) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

export interface UsePatchDataReturn {
  /** Patch data */
  data: PatchData | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether data is from cache */
  fromCache: boolean;
  /** Refetch data */
  refetch: () => Promise<void>;
  /** Clear cache and refetch */
  refresh: () => Promise<void>;
}

/**
 * Hook for loading patch data with caching support
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data, loading, error, refetch } = usePatchData({
 *     useCache: true,
 *     onLoad: (data) => console.log('Loaded:', data)
 *   });
 * 
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!data) return null;
 * 
 *   return <NewsUpdatesSection patchData={data} />;
 * }
 * ```
 */
export function usePatchData(options: UsePatchDataOptions = {}): UsePatchDataReturn {
  const {
    useCache = true,
    immediate = true,
    onLoad,
    onError,
  } = options;

  const [data, setData] = useState<PatchData | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState(false);

  /**
   * Fetch patch data from file
   */
  const fetchPatchData = useCallback(async (): Promise<PatchData> => {
    try {
      const response = await fetch('/Patch.txt');
      if (!response.ok) {
        throw new Error(`Failed to fetch patch data: ${response.statusText}`);
      }
      const htmlContent = await response.text();
      const parsedData = PatchParser.parse(htmlContent);
      return parsedData;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error occurred');
    }
  }, []);

  /**
   * Load patch data with caching
   */
  const loadData = useCallback(async (skipCache = false) => {
    setLoading(true);
    setError(null);
    setFromCache(false);

    try {
      // Try to get from cache first
      if (useCache && !skipCache) {
        const cachedData = getCachedPatchData();
        if (cachedData) {
          setData(cachedData);
          setFromCache(true);
          setLoading(false);
          onLoad?.(cachedData);
          return;
        }
      }

      // Fetch fresh data
      const freshData = await fetchPatchData();
      
      // Cache the data
      if (useCache) {
        setCachedPatchData(freshData);
      }

      setData(freshData);
      setFromCache(false);
      onLoad?.(freshData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load patch data');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [useCache, fetchPatchData, onLoad, onError]);

  /**
   * Refetch data (respects cache)
   */
  const refetch = useCallback(async () => {
    await loadData(false);
  }, [loadData]);

  /**
   * Refresh data (clears cache first)
   */
  const refresh = useCallback(async () => {
    clearCachedPatchData();
    await loadData(true);
  }, [loadData]);

  // Load data on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      loadData();
    }
  }, [immediate, loadData]);

  return {
    data,
    loading,
    error,
    fromCache,
    refetch,
    refresh,
  };
}
