import { useRef, useCallback, useState, useEffect } from "react";

/**
 * useDebouncedValue
 * @param value The value to debounce
 * @param delay Debounce delay in ms
 * @returns [debouncedValue, setValue]
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number
): [T, (v: T) => void] {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const setValue = useCallback(
    (v: T) => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        setDebouncedValue(v);
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [value, delay]);

  return [debouncedValue, setValue];
}
