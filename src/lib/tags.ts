// src/lib/tags.ts
import { createClient } from '@/lib/supabase';
import type { Tag } from '@/lib/types';

export async function fetchTags(userId: string): Promise<Tag[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createTag(
  userId: string,
  name: string,
  color = '#6366f1'
): Promise<Tag> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tags')
    .insert({ user_id: userId, name: name.trim(), color })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTag(
  id: string,
  fields: Partial<Pick<Tag, 'name' | 'color'>>
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('tags')
    .update(fields)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteTag(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('tags').delete().eq('id', id);
  if (error) throw error;
}
