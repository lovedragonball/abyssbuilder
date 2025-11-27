/**
 * Tests for patch data caching utilities
 */

import {
  getCachedPatchData,
  setCachedPatchData,
  clearCachedPatchData,
  getCacheAge,
  isCacheValid,
} from '../patch-cache';
import { PatchData } from '../patch-data';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Patch Cache', () => {
  const mockPatchData: PatchData = {
    knownIssues: [
      {
        id: 'issue-1',
        description: 'Test issue',
        highlightedTerms: ['Test'],
      },
    ],
    updates: [
      {
        date: '2025-11-22',
        displayDate: 'Update Details - 2025-11-22',
        notes: [
          {
            id: 'note-1',
            description: 'Test fix',
            highlightedTerms: ['Test'],
            type: 'fix',
          },
        ],
      },
    ],
    lastUpdated: new Date().toISOString(),
  };

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('setCachedPatchData', () => {
    it('should cache patch data in localStorage', () => {
      setCachedPatchData(mockPatchData);

      const cached = localStorageMock.getItem('patch-data-cache');
      expect(cached).toBeTruthy();

      const parsed = JSON.parse(cached!);
      expect(parsed.data).toEqual(mockPatchData);
      expect(parsed.timestamp).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock localStorage.setItem to throw error
      jest.spyOn(localStorageMock, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage full');
      });

      setCachedPatchData(mockPatchData);

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCachedPatchData', () => {
    it('should return cached data if valid', () => {
      setCachedPatchData(mockPatchData);

      const cached = getCachedPatchData();
      expect(cached).toEqual(mockPatchData);
    });

    it('should return null if no cache exists', () => {
      const cached = getCachedPatchData();
      expect(cached).toBeNull();
    });

    it('should return null and clear cache if expired', () => {
      // Set cache with old timestamp (2 hours ago)
      const oldTimestamp = Date.now() - 2 * 60 * 60 * 1000;
      localStorageMock.setItem(
        'patch-data-cache',
        JSON.stringify({
          data: mockPatchData,
          timestamp: oldTimestamp,
        })
      );

      const cached = getCachedPatchData();
      expect(cached).toBeNull();
      expect(localStorageMock.getItem('patch-data-cache')).toBeNull();
    });

    it('should handle corrupted cache data', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      localStorageMock.setItem('patch-data-cache', 'invalid json');

      const cached = getCachedPatchData();
      expect(cached).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearCachedPatchData', () => {
    it('should remove cached data', () => {
      setCachedPatchData(mockPatchData);
      expect(localStorageMock.getItem('patch-data-cache')).toBeTruthy();

      clearCachedPatchData();
      expect(localStorageMock.getItem('patch-data-cache')).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      jest.spyOn(localStorageMock, 'removeItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      clearCachedPatchData();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCacheAge', () => {
    it('should return cache age in milliseconds', () => {
      setCachedPatchData(mockPatchData);

      const age = getCacheAge();
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(1000); // Should be less than 1 second
    });

    it('should return null if no cache exists', () => {
      const age = getCacheAge();
      expect(age).toBeNull();
    });
  });

  describe('isCacheValid', () => {
    it('should return true for valid cache', () => {
      setCachedPatchData(mockPatchData);

      const valid = isCacheValid();
      expect(valid).toBe(true);
    });

    it('should return false for expired cache', () => {
      const oldTimestamp = Date.now() - 2 * 60 * 60 * 1000;
      localStorageMock.setItem(
        'patch-data-cache',
        JSON.stringify({
          data: mockPatchData,
          timestamp: oldTimestamp,
        })
      );

      const valid = isCacheValid();
      expect(valid).toBe(false);
    });

    it('should return false if no cache exists', () => {
      const valid = isCacheValid();
      expect(valid).toBe(false);
    });
  });

  describe('Cache expiration', () => {
    it('should expire after 1 hour', () => {
      // Set cache with timestamp 1 hour and 1 second ago
      const expiredTimestamp = Date.now() - (60 * 60 * 1000 + 1000);
      localStorageMock.setItem(
        'patch-data-cache',
        JSON.stringify({
          data: mockPatchData,
          timestamp: expiredTimestamp,
        })
      );

      const cached = getCachedPatchData();
      expect(cached).toBeNull();
    });

    it('should not expire before 1 hour', () => {
      // Set cache with timestamp 59 minutes ago
      const validTimestamp = Date.now() - (59 * 60 * 1000);
      localStorageMock.setItem(
        'patch-data-cache',
        JSON.stringify({
          data: mockPatchData,
          timestamp: validTimestamp,
        })
      );

      const cached = getCachedPatchData();
      expect(cached).toEqual(mockPatchData);
    });
  });
});
