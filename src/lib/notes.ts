// src/lib/notes.ts
import { createClient } from '@/lib/supabase';
import type { Note } from '@/types/note';

export async function fetchNotes(userId: string): Promise<Note[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createNote(
  userId: string,
  partial: Partial<Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {}
): Promise<Note> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      title: partial.title ?? 'Untitled',
      encrypted_body: partial.encrypted_body ?? '',
      is_encrypted: partial.is_encrypted ?? false,
      pinned: partial.pinned ?? false,
      iv: partial.iv ?? '',
      salt: partial.salt ?? '',
      tags: partial.tags ?? [],
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateNote(
  id: string,
  fields: Partial<Pick<Note, 'title' | 'encrypted_body' | 'is_encrypted' | 'pinned' | 'tags' | 'iv' | 'salt'>>
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('notes')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateNote(note: Note, userId: string): Promise<Note> {
  return createNote(userId, {
    title: `${note.title} (copy)`,
    encrypted_body: note.is_encrypted ? '' : note.encrypted_body,
    is_encrypted: false,
    pinned: false,
    iv: '',
    salt: '',
    tags: note.tags,
  });
}
