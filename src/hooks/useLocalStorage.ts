import { useState, useCallback } from 'react';
import type { StoredData } from '../types';

const STORAGE_VERSION = 1;

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed: StoredData<T> = JSON.parse(item);
        return parsed.data;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        try {
          const storedData: StoredData<T> = {
            version: STORAGE_VERSION,
            data: valueToStore,
            lastModified: Date.now(),
          };
          window.localStorage.setItem(key, JSON.stringify(storedData));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
      const parsed: StoredData<T> = JSON.parse(item);
      return parsed.data;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    const storedData: StoredData<T> = {
      version: STORAGE_VERSION,
      data: value,
      lastModified: Date.now(),
    };
    window.localStorage.setItem(key, JSON.stringify(storedData));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
}

export function removeFromStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}
