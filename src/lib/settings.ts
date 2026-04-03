// src/lib/settings.ts
import { createClient } from '@/lib/supabase';
import type { UserSettings } from '@/lib/types';

export const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  theme: 'system',
  editor_mode: 'normal',
  enable_mathjax: false,
  enable_syntax_highlighting: true,
  font_size: 14,
  auto_save: true,
  keybindings_preset: 'default',
  language: 'en',
};

export async function fetchSettings(userId: string): Promise<UserSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;
  // Row doesn't exist yet — upsert defaults and return them.
  return upsertSettings(userId, {});
}

export async function upsertSettings(
  userId: string,
  fields: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      { ...DEFAULT_SETTINGS, ...fields, user_id: userId },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSettings(
  userId: string,
  fields: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('user_settings')
    .update(fields)
    .eq('user_id', userId);
  if (error) throw error;
}
