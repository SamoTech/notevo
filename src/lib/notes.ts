// src/lib/notes.ts
import { createClient } from '@/lib/supabase';
import type { Note, DecryptedNote } from '@/types/note';

/** Hydrate a raw DB row into a DecryptedNote (adds UI-only fields with safe defaults). */
function hydrate(row: Note): DecryptedNote {
  return {
    ...row,
    decryptedContent: undefined,
    isUnlocked: false,
  };
}

/** Columns that actually exist in the DB — used to strip UI-only fields before upsert. */
const DB_COLUMNS = new Set([
  'title',
  'encrypted_body',
  'is_encrypted',
  'pinned',
  'tags',
  'iv',
  'salt',
]);

function toDbFields(
  fields: Partial<DecryptedNote>
): Partial<Pick<Note, 'title' | 'encrypted_body' | 'is_encrypted' | 'pinned' | 'tags' | 'iv' | 'salt'>> {
  return Object.fromEntries(
    Object.entries(fields).filter(([k]) => DB_COLUMNS.has(k))
  ) as ReturnType<typeof toDbFields>;
}

export async function fetchNotes(userId: string): Promise<DecryptedNote[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(hydrate);
}

export async function createNote(
  userId: string,
  partial: Partial<Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {}
): Promise<DecryptedNote> {
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
  return hydrate(data);
}

export async function updateNote(
  id: string,
  fields: Partial<DecryptedNote>
): Promise<void> {
  const supabase = createClient();
  const dbFields = toDbFields(fields);
  if (Object.keys(dbFields).length === 0) return; // nothing to update
  const { error } = await supabase
    .from('notes')
    .update({ ...dbFields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateNote(note: DecryptedNote, userId: string): Promise<DecryptedNote> {
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
