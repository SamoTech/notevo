'use client';
// src/hooks/useNotes.ts
import { useState, useCallback, useEffect } from 'react';
import type { DecryptedNote, NoteFilter, SortKey } from '@/types/note';
import { fetchNotes, createNote, updateNote, deleteNote, duplicateNote } from '@/lib/notes';

const SAMPLE_NOTES: DecryptedNote[] = [
  {
    id: 'sample-1',
    user_id: '',
    title: 'Welcome to Notevo',
    content:
      '# Welcome to Notevo\n\nThis is your first note. Start writing in **Markdown**!\n\n## Features\n- 🔒 Encrypted notes\n- 📝 Live Markdown preview\n- 🌍 Multilingual UI\n- 🌙 Dark mode',
    is_encrypted: false,
    is_pinned: true,
    iv: null,
    salt: null,
    tags: ['welcome'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useNotes(userId: string | null) {
  const [notes, setNotes] = useState<DecryptedNote[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NoteFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!userId) {
      setNotes(SAMPLE_NOTES);
      setSelectedId(SAMPLE_NOTES[0].id);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchNotes(userId);
      if (data.length > 0) {
        setNotes(data);
        setSelectedId(data[0].id);
      } else {
        setNotes(SAMPLE_NOTES);
        setSelectedId(SAMPLE_NOTES[0].id);
      }
    } catch {
      setNotes(SAMPLE_NOTES);
      setSelectedId(SAMPLE_NOTES[0].id);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredSorted = notes
    .filter((n) => {
      if (filter === 'encrypted') return n.is_encrypted;
      if (filter === 'plain') return !n.is_encrypted;
      return true;
    })
    .filter((n) =>
      search
        ? n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      if (sortKey === 'title') return a.title.localeCompare(b.title);
      if (sortKey === 'created') return b.created_at.localeCompare(a.created_at);
      return b.updated_at.localeCompare(a.updated_at);
    });

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const addNote = useCallback(async () => {
    if (!userId) return;
    try {
      const n = await createNote(userId);
      setNotes((prev) => [n, ...prev]);
      setSelectedId(n.id);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  }, [userId]);

  const saveNote = useCallback(
    async (id: string, fields: Partial<DecryptedNote>) => {
      // Optimistic update
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, ...fields, updated_at: new Date().toISOString() } : n
        )
      );
      if (!id.startsWith('sample') && userId) {
        try {
          await updateNote(id, fields);
        } catch (err) {
          console.error('Failed to save note:', err);
        }
      }
    },
    [userId]
  );

  const removeNote = useCallback(
    async (id: string) => {
      setNotes((prev) => {
        const remaining = prev.filter((n) => n.id !== id);
        if (selectedId === id) {
          setSelectedId(remaining[0]?.id ?? null);
        }
        return remaining;
      });
      if (!id.startsWith('sample') && userId) {
        try {
          await deleteNote(id);
        } catch (err) {
          console.error('Failed to delete note:', err);
        }
      }
    },
    [selectedId, userId]
  );

  const dupNote = useCallback(
    async (note: DecryptedNote) => {
      if (!userId) return;
      try {
        const copy = await duplicateNote(note, userId);
        setNotes((prev) => [copy, ...prev]);
        setSelectedId(copy.id);
      } catch (err) {
        console.error('Failed to duplicate note:', err);
      }
    },
    [userId]
  );

  const togglePin = useCallback(
    async (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (!note) return;
      await saveNote(id, { is_pinned: !note.is_pinned });
    },
    [notes, saveNote]
  );

  return {
    notes: filteredSorted,
    allNotes: notes,
    selectedNote,
    selectedId,
    setSelectedId,
    loading,
    filter,
    setFilter,
    sortKey,
    setSortKey,
    search,
    setSearch,
    addNote,
    saveNote,
    removeNote,
    dupNote,
    togglePin,
    reload: load,
  };
}
