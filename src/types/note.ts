// src/types/note.ts

export type NoteFilter = 'all' | 'encrypted' | 'plain';
export type SortKey = 'updated' | 'created' | 'title';
export type Locale = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'zh';
export type Theme = 'light' | 'dark';
export type ViewMode = 'edit' | 'preview' | 'split';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Mirrors the `notes` table in Supabase exactly.
 * Use `encrypted_body` for the raw (possibly ciphertext) body
 * and `decryptedContent` (on DecryptedNote) for the plaintext after unlock.
 */
export interface Note {
  id: string;
  user_id: string;
  title: string;
  /** Raw body stored in DB — may be ciphertext when is_encrypted = true */
  encrypted_body: string;
  is_encrypted: boolean;
  /** Pinned flag — stored as `pinned` in Supabase */
  pinned: boolean;
  /** AES-GCM IV (base64). Empty string when note is not encrypted. */
  iv: string;
  /** PBKDF2 salt (base64). Empty string when note is not encrypted. */
  salt: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

/** Extended view of a Note after client-side decryption. */
export interface DecryptedNote extends Note {
  /** Plaintext content — populated after the user unlocks an encrypted note */
  decryptedContent?: string;
  /** True once the user has successfully provided the password */
  isUnlocked?: boolean;
}
