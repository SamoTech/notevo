// src/lib/notes.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Note } from '@/types/note';

const supabase = createClientComponentClient();

export async function fetchNotes(userId: string): Promise<Note[]> {
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
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      title: partial.title ?? 'Untitled',
      content: partial.content ?? '',
      is_encrypted: partial.is_encrypted ?? false,
      is_pinned: partial.is_pinned ?? false,
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
  fields: Partial<Pick<Note, 'title' | 'content' | 'is_encrypted' | 'is_pinned' | 'tags'>>
): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateNote(note: Note, userId: string): Promise<Note> {
  return createNote(userId, {
    title: `${note.title} (copy)`,
    content: note.content,
    is_encrypted: false,
    is_pinned: false,
    tags: note.tags,
  });
}
