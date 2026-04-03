// src/lib/import-export.ts
// ZIP-based backup and restore (Laverna-compatible format)
import { createClient } from '@/lib/supabase';
import type { ExportData, Note } from '@/lib/types';

const FORMAT_VERSION = '1.0.0';

// ─── Export ─────────────────────────────────────────────────────────────────

export async function exportAllData(userId: string): Promise<Blob> {
  const supabase = createClient();

  const [notesRes, tagsRes, settingsRes] = await Promise.all([
    supabase.from('notes').select('*').eq('user_id', userId),
    supabase.from('tags').select('*').eq('user_id', userId),
    supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  if (notesRes.error) throw notesRes.error;
  if (tagsRes.error) throw tagsRes.error;

  const exportData: ExportData = {
    notes: notesRes.data ?? [],
    notebooks: [],
    tags: tagsRes.data ?? [],
    settings: settingsRes.data ?? undefined,
    export_date: new Date().toISOString(),
    version: FORMAT_VERSION,
  };

  return buildZip(exportData);
}

export async function exportNotes(notes: Note[]): Promise<Blob> {
  const exportData: ExportData = {
    notes,
    notebooks: [],
    tags: [],
    export_date: new Date().toISOString(),
    version: FORMAT_VERSION,
  };
  return buildZip(exportData);
}

async function buildZip(exportData: ExportData): Promise<Blob> {
  // Dynamic import so the JSZip bundle is never loaded unless needed.
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // manifest.json
  zip.file('manifest.json', JSON.stringify({
    version: exportData.version,
    export_date: exportData.export_date,
    note_count: exportData.notes.length,
  }, null, 2));

  // data.json — full structured backup
  zip.file('data.json', JSON.stringify(exportData, null, 2));

  // notes/ — one .md per note for human readability
  const notesFolder = zip.folder('notes')!;
  for (const note of exportData.notes) {
    const safeName = note.title.replace(/[/\\?%*:|"<>]/g, '-').slice(0, 80);
    const header = [
      '---',
      `id: ${note.id}`,
      `title: ${note.title}`,
      `tags: [${(note.tags ?? []).join(', ')}]`,
      `encrypted: ${note.is_encrypted}`,
      `created: ${note.created_at}`,
      `updated: ${note.updated_at}`,
      '---',
      '',
    ].join('\n');
    notesFolder.file(`${safeName}.md`, header + (note.is_encrypted ? '[encrypted]' : note.encrypted_body));
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

// ─── Import ─────────────────────────────────────────────────────────────────

export interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  skipped: number;
}

export async function importFromZip(file: File, userId: string): Promise<ImportResult> {
  const JSZip = (await import('jszip')).default;
  let zip: InstanceType<typeof JSZip>;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    return { success: false, message: 'Invalid ZIP file.', imported: 0, skipped: 0 };
  }

  const dataFile = zip.file('data.json');
  if (!dataFile) {
    return { success: false, message: 'data.json not found in ZIP. Is this a valid Notevo backup?', imported: 0, skipped: 0 };
  }

  let exportData: ExportData;
  try {
    const raw = await dataFile.async('string');
    exportData = JSON.parse(raw);
    const validation = validateExportData(exportData);
    if (!validation.valid) {
      return { success: false, message: `Invalid backup format: ${validation.error}`, imported: 0, skipped: 0 };
    }
  } catch {
    return { success: false, message: 'Could not parse data.json.', imported: 0, skipped: 0 };
  }

  const supabase = createClient();
  let imported = 0;
  let skipped = 0;

  // Import notes (upsert by id)
  for (const note of exportData.notes) {
    const { error } = await supabase
      .from('notes')
      .upsert({ ...note, user_id: userId }, { onConflict: 'id', ignoreDuplicates: false });
    if (error) { skipped++; } else { imported++; }
  }

  // Import tags (upsert by user_id + name)
  for (const tag of exportData.tags ?? []) {
    await supabase
      .from('tags')
      .upsert({ ...tag, user_id: userId }, { onConflict: 'user_id,name', ignoreDuplicates: true });
  }

  // Import settings (upsert)
  if (exportData.settings) {
    await supabase
      .from('user_settings')
      .upsert({ ...exportData.settings, user_id: userId }, { onConflict: 'user_id' });
  }

  return {
    success: true,
    message: `Import complete. ${imported} note(s) imported, ${skipped} skipped.`,
    imported,
    skipped,
  };
}

export function validateExportData(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') return { valid: false, error: 'Not an object' };
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.notes)) return { valid: false, error: '"notes" must be an array' };
  if (!d.export_date) return { valid: false, error: '"export_date" is missing' };
  return { valid: true };
}
