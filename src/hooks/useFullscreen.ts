'use client';
// src/hooks/useFullscreen.ts
import { useState, useCallback } from 'react';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggle = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const enter = useCallback(() => setIsFullscreen(true), []);
  const exit = useCallback(() => setIsFullscreen(false), []);

  return { isFullscreen, toggle, enter, exit };
}
