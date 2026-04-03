// src/types/note.ts

export type NoteFilter = 'all' | 'encrypted' | 'plain';
export type SortKey = 'updated' | 'created' | 'title';
export type Locale = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'zh';
export type Theme = 'light' | 'dark';
export type ViewMode = 'edit' | 'preview' | 'split';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_encrypted: boolean;
  is_pinned: boolean;
  iv: string | null;
  salt: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DecryptedNote extends Note {
  decryptedContent?: string;
  isUnlocked?: boolean;
}
