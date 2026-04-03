'use client';
// src/hooks/useEncryption.ts
import { useState, useCallback } from 'react';
import { encryptNote as encryptContent, decryptNote as decryptContent } from '@/lib/crypto';
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
        const { ciphertext, iv, salt } = await encryptContent(password, note.encrypted_body);
        await onSave(note.id, { encrypted_body: ciphertext, is_encrypted: true, iv, salt });
        setShowEncryptDialog(false);
      } catch {
        throw new Error('Encryption failed');
      }
    },
    [note, onSave]
  );

  const decryptNote = useCallback(
    async (password: string): Promise<boolean> => {
      if (!note || !note.iv || !note.salt) return false;
      try {
        const result = await decryptContent(password, note.encrypted_body, note.iv, note.salt);
        // Only check result.success — result.text can legitimately be an
        // empty string if the note had no content when it was encrypted.
        if (!result.success) {
          setUnlockError('Incorrect password. Please try again.');
          return false;
        }
        setUnlockedNotes((prev) => ({ ...prev, [note.id]: result.text }));
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

  /** Returns decrypted content if unlocked, null if locked, raw body if not encrypted */
  const getDisplayContent = useCallback(
    (n: DecryptedNote): string | null => {
      if (!n.is_encrypted) return n.encrypted_body;
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
