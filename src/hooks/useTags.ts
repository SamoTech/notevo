'use client';
// src/hooks/useTags.ts
import { useState, useEffect, useCallback } from 'react';
import type { Tag } from '@/lib/types';
import { fetchTags, createTag, updateTag, deleteTag } from '@/lib/tags';

export function useTags(userId: string | null) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setTags([]); setLoading(false); return; }
    fetchTags(userId)
      .then(setTags)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const addTag = useCallback(async (name: string, color?: string) => {
    if (!userId) return;
    const tag = await createTag(userId, name, color);
    setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
    return tag;
  }, [userId]);

  const editTag = useCallback(async (id: string, fields: Partial<Pick<Tag, 'name' | 'color'>>) => {
    setTags((prev) => prev.map((t) => t.id === id ? { ...t, ...fields } : t));
    await updateTag(id, fields);
  }, []);

  const removeTag = useCallback(async (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    await deleteTag(id);
  }, []);

  return { tags, loading, addTag, editTag, removeTag };
}
