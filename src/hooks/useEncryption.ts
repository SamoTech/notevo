'use client';
// src/hooks/useEncryption.ts
import { useState, useCallback } from 'react';
import { encryptContent, decryptContent } from '@/lib/crypto';
import type { DecryptedNote } from '@/types/note';

type SaveFn = (id: string, fields: Partial<DecryptedNote>) => Promise<void>;

/**
 * Manages note encryption/decryption UI state and ephemeral unlock map.
 * Decrypted content is stored in memory only — never persisted.
 */
export function useEncryption(note: DecryptedNote | null, onSave: SaveFn) {
  const [showEncryptDialog, setShowEncryptDialog] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  // Map of note id → decrypted plaintext (ephemeral, memory-only)
  const [unlockedNotes, setUnlockedNotes] = useState<Record<string, string>>({});

  const encryptNote = useCallback(
    async (password: string) => {
      if (!note) return;
      try {
        const encrypted = await encryptContent(note.content, password);
        await onSave(note.id, { content: encrypted, is_encrypted: true });
        setShowEncryptDialog(false);
      } catch {
        // Propagate to caller for display
        throw new Error('Encryption failed');
      }
    },
    [note, onSave]
  );

  const decryptNote = useCallback(
    async (password: string): Promise<boolean> => {
      if (!note) return false;
      try {
        const plain = await decryptContent(note.content, password);
        setUnlockedNotes((prev) => ({ ...prev, [note.id]: plain }));
        setUnlockError('');
        setShowUnlock(false);
        return true;
      } catch {
        setUnlockError('Incorrect password. Please try again.');
        return false;
      }
    },
    [note]
  );

  const lockNote = useCallback((id: string) => {
    setUnlockedNotes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  /** Returns decrypted content if unlocked, null if locked, raw content if not encrypted */
  const getDisplayContent = useCallback(
    (n: DecryptedNote): string | null => {
      if (!n.is_encrypted) return n.content;
      return unlockedNotes[n.id] ?? null;
    },
    [unlockedNotes]
  );

  const isUnlocked = useCallback(
    (id: string): boolean => id in unlockedNotes,
    [unlockedNotes]
  );

  return {
    showEncryptDialog,
    setShowEncryptDialog,
    showUnlock,
    setShowUnlock,
    unlockError,
    setUnlockError,
    encryptNote,
    decryptNote,
    lockNote,
    getDisplayContent,
    isUnlocked,
  };
}
