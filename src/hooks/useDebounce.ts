import { useState, useEffect } from "react";

/**
 * Custom hook for debouncing a value.
 *
 * Why a custom hook instead of a library?
 * - Simple use case, ~10 lines of code
 * - No external dependency needed
 * - Easy to explain in an interview
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay completes
    // This is the key to debouncing - we cancel pending updates
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
