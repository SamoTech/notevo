'use client';
// src/hooks/useAutosave.ts
import { useEffect, useRef, useState } from 'react';
import type { SaveStatus } from '@/types/note';

/**
 * Debounced autosave hook.
 * Returns the current save status so the UI can show saving/saved/error.
 *
 * @param value   - The value to watch (note content, title, etc.)
 * @param onSave  - Async function called with the latest value after debounce
 * @param delay   - Debounce delay in ms (default 1200)
 */
export function useAutosave(
  value: string,
  onSave: (v: string) => Promise<void>,
  delay = 1200
): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(value);
  const onSaveRef = useRef(onSave);

  // Keep onSave ref up to date without re-triggering the effect
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (value === lastSaved.current) return;
    setStatus('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await onSaveRef.current(value);
        lastSaved.current = value;
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } catch {
        setStatus('error');
      }
    }, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, delay]);

  return status;
}
