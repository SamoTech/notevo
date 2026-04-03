'use client';
// src/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@/lib/types';
import { fetchSettings, updateSettings, DEFAULT_SETTINGS } from '@/lib/settings';

export function useSettings(userId: string | null) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSettings(null);
      setLoading(false);
      return;
    }
    fetchSettings(userId)
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const update = useCallback(
    async (fields: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!userId) return;
      // Optimistic update
      setSettings((prev) => prev ? { ...prev, ...fields } : null);
      try {
        await updateSettings(userId, fields);
      } catch (err) {
        console.error('Failed to update settings:', err);
        // Revert on error
        if (userId) fetchSettings(userId).then(setSettings).catch(console.error);
      }
    },
    [userId]
  );

  return {
    settings,
    loading,
    update,
    effective: settings ?? { ...DEFAULT_SETTINGS, id: '', user_id: userId ?? '', created_at: '', updated_at: '' },
  };
}
