// src/lib/export.ts
import type { Note } from '@/types/note';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportNoteAsMarkdown(note: Note): void {
  const blob = new Blob([note.content], { type: 'text/markdown;charset=utf-8' });
  const safeName = note.title.replace(/[^a-z0-9\-_. ]/gi, '_').trim() || 'note';
  triggerDownload(blob, `${safeName}.md`);
}

export function exportAllNotesAsJSON(notes: Note[]): void {
  const blob = new Blob([JSON.stringify(notes, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  triggerDownload(blob, `notevo-export-${Date.now()}.json`);
}

export async function importNotesFromJSON(
  file: File
): Promise<Array<Partial<Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>>>> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON file — could not parse.');
  }
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  return arr.map((n: unknown) => {
    const note = n as Record<string, unknown>;
    return {
      title: typeof note.title === 'string' ? note.title.slice(0, 200) : 'Imported Note',
      content: typeof note.content === 'string' ? note.content : '',
      tags: Array.isArray(note.tags)
        ? (note.tags as unknown[]).filter((t): t is string => typeof t === 'string').slice(0, 20)
        : [],
      is_encrypted: false,
      is_pinned: false,
    };
  });
}

export async function importNoteFromMarkdown(
  file: File
): Promise<Partial<Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>>> {
  const content = await file.text();
  const title = file.name
    .replace(/\.md$/i, '')
    .replace(/_/g, ' ')
    .slice(0, 200)
    .trim() || 'Imported Note';
  return { title, content, tags: [], is_encrypted: false, is_pinned: false };
}
