'use client';
// src/hooks/useLocale.ts
import { useState, useEffect, useCallback } from 'react';
import type { Locale } from '@/types/note';

const RTL_LOCALES: Locale[] = ['ar'];
const STORAGE_KEY = 'notevo-locale';
const VALID_LOCALES: Locale[] = ['en', 'ar', 'fr', 'es', 'de', 'zh'];

function applyLocale(l: Locale) {
  document.documentElement.lang = l;
  document.documentElement.dir = RTL_LOCALES.includes(l) ? 'rtl' : 'ltr';
  try {
    localStorage.setItem(STORAGE_KEY, l);
  } catch {
    // Ignore
  }
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && VALID_LOCALES.includes(stored)) {
        setLocaleState(stored);
        applyLocale(stored);
      }
    } catch {
      // Ignore
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    if (!VALID_LOCALES.includes(l)) return;
    setLocaleState(l);
    applyLocale(l);
  }, []);

  return {
    locale,
    setLocale,
    isRtl: RTL_LOCALES.includes(locale),
    availableLocales: VALID_LOCALES,
  };
}
