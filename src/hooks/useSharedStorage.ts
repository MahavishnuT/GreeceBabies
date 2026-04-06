import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const POLL_INTERVAL = 3000;

async function fetchKey<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/data/${key}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function postKey<T>(key: string, value: T): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/data/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useSharedStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [data, setDataState] = useState<T>(() => {
    // Start with localStorage value while we fetch from server
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const dataRef = useRef(data);
  const skipNextPollRef = useRef(false);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Fetch from server on mount
  useEffect(() => {
    fetchKey<T>(key).then((val) => {
      if (val !== null) {
        setDataState(val);
        dataRef.current = val;
        try {
          window.localStorage.setItem(key, JSON.stringify(val));
        } catch {
          /* ignore */
        }
      }
    });
  }, [key]);

  // Poll for updates from other users
  useEffect(() => {
    const interval = setInterval(() => {
      if (skipNextPollRef.current) {
        skipNextPollRef.current = false;
        return;
      }
      fetchKey<T>(key).then((val) => {
        if (val !== null) {
          const current = JSON.stringify(dataRef.current);
          const remote = JSON.stringify(val);
          if (current !== remote) {
            setDataState(val);
            dataRef.current = val;
            try {
              window.localStorage.setItem(key, JSON.stringify(val));
            } catch {
              /* ignore */
            }
          }
        }
      });
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [key]);

  const setData = useCallback(
    (value: T | ((prev: T) => T)) => {
      const newVal =
        typeof value === 'function'
          ? (value as (prev: T) => T)(dataRef.current)
          : value;
      setDataState(newVal);
      dataRef.current = newVal;
      skipNextPollRef.current = true;

      // Save to localStorage as fallback
      try {
        window.localStorage.setItem(key, JSON.stringify(newVal));
      } catch {
        /* ignore */
      }

      // Save to server
      postKey(key, newVal);
    },
    [key],
  );

  return [data, setData];
}
