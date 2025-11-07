import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';

/**
 * Custom hook for managing localStorage with React state
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    return storage.getItem(key, initialValue);
  });

  // State to track loading
  const [isLoading, setIsLoading] = useState(true);

  // State to track errors
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const value = storage.getItem(key, initialValue);
      setStoredValue(value);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [key, initialValue]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to local storage
        const success = storage.setItem(key, valueToStore);
        
        if (!success) {
          throw new Error('Failed to save to localStorage');
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error(`Error setting localStorage key "${key}":`, err);
      }
    },
    [key, storedValue]
  );

  // Function to remove the item
  const removeValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setStoredValue(initialValue);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error(`Error removing localStorage key "${key}":`, err);
    }
  }, [key, initialValue]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    isLoading,
    error,
  };
}
