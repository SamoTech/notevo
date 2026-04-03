'use client';
// src/hooks/useAutosave.ts
import { useEffect, useRef, useState } from 'react';
import type { SaveStatus } from '@/types/note';

/**
 * Debounced autosave hook.
 *
 * @param key     - Identity of the thing being edited (e.g. note ID).
 *                  When this changes the hook resets – no spurious save fires
 *                  just because a different note has different content.
 * @param value   - Serialisable snapshot of everything that should be saved.
 *                  Pass a stable JSON string or primitive so the effect can
 *                  do a cheap equality check.
 * @param onSave  - Async callback called after the debounce elapses.
 * @param delay   - Debounce delay in ms (default 1 200).
 */
export function useAutosave(
  key: string | null,
  value: string,
  onSave: () => Promise<void>,
  delay = 1200
): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle');

  // Stable ref for the latest onSave so we never need it in the dep array.
  const onSaveRef = useRef(onSave);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);

  // Track the last value that was actually persisted for this key.
  const lastSavedRef = useRef<string>(value);
  const lastKeyRef   = useRef<string | null>(key);

  useEffect(() => {
    // Key changed → new note selected. Reset baseline so we don't
    // immediately fire a save just because the content differs.
    if (key !== lastKeyRef.current) {
      lastKeyRef.current   = key;
      lastSavedRef.current = value;
      setStatus('idle');
      return;
    }

    // Nothing actually changed since the last successful save.
    if (value === lastSavedRef.current) return;

    // Something changed – show "saving" immediately for responsive UI.
    setStatus('saving');

    const timer = setTimeout(async () => {
      try {
        await onSaveRef.current();
        lastSavedRef.current = value;
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } catch {
        setStatus('error');
      }
    }, delay);

    // Cancel the pending timer if value changes again before it fires,
    // or if the component unmounts. Does NOT run on every render –
    // only when `value`, `key`, or `delay` changes.
    return () => clearTimeout(timer);
  }, [key, value, delay]);

  return status;
}
