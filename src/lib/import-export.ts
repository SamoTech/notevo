/**
 * Import/Export Utility for Notevo
 * Laverna feature: ZIP-based backup and restore
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Note, Notebook, Tag, UserSettings, ExportData } from './types';

const EXPORT_VERSION = '1.0.0';

/**
 * Export all user data to a ZIP file
 */
export async function exportAllData(
  notes: Note[],
  notebooks: Notebook[],
  tags: Tag[],
  settings?: UserSettings
): Promise<void> {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().split('T')[0];
  const folderName = `notevo-backup-${timestamp}`;
  
  // Create folder structure
  const notesFolder = zip.folder(`${folderName}/notes`)!;
  const notebooksFolder = zip.folder(`${folderName}/notebooks`)!;
  const tagsFolder = zip.folder(`${folderName}/tags`)!;
  const settingsFolder = zip.folder(`${folderName}/settings`)!;

  // Export notes as both JSON and Markdown (Laverna style)
  notes.forEach((note) => {
    // Save note metadata as JSON
    notesFolder.file(
      `${note.id}.json`,
      JSON.stringify({ ...note, encrypted_body: undefined }, null, 2)
    );
    
    // Save note content as Markdown
    notesFolder.file(`${note.id}.md`, note.encrypted_body);
  });

  // Export notebooks
  notebooksFolder.file(
    'notebooks.json',
    JSON.stringify(notebooks, null, 2)
  );

  // Export tags
  tagsFolder.file(
    'tags.json',
    JSON.stringify(tags, null, 2)
  );

  // Export settings if available
  if (settings) {
    settingsFolder.file(
      'settings.json',
      JSON.stringify(settings, null, 2)
    );
  }

  // Add manifest
  const manifest: ExportData = {
    notes,
    notebooks,
    tags,
    settings,
    export_date: new Date().toISOString(),
    version: EXPORT_VERSION,
  };
  
  zip.file(`${folderName}/manifest.json`, JSON.stringify(manifest, null, 2));

  // Generate and download ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${folderName}.zip`);
}

/**
 * Import data from a ZIP file
 */
export async function importFromZip(file: File): Promise<{
  notes: Note[];
  notebooks: Notebook[];
  tags: Tag[];
  settings?: UserSettings;
  errors: string[];
}> {
  const errors: string[] = [];
  const notes: Note[] = [];
  const notebooks: Notebook[] = [];
  const tags: Tag[] = [];
  let settings: UserSettings | undefined;

  try {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);

    // Find manifest or root folder
    let basePath = '';
    const manifestFile = Object.keys(loadedZip.files).find(f => 
      f.endsWith('/manifest.json') || f === 'manifest.json'
    );
    
    if (manifestFile) {
      basePath = manifestFile.split('/').slice(0, -1).join('/');
      if (basePath) basePath += '/';
      
      const manifestContent = await loadedZip.file(manifestFile)!.async('text');
      const manifest = JSON.parse(manifestContent) as ExportData;
      
      // Validate manifest
      if (!manifest.version) {
        errors.push('Invalid manifest: missing version');
      }
    }

    // Process each file in the ZIP
    const filePromises = Object.keys(loadedZip.files).map(async (filePath) => {
      const zipEntry = loadedZip.files[filePath];
      
      if (zipEntry.dir) return;
      
      const relativePath = filePath.replace(basePath, '');
      const parts = relativePath.split('/');

      try {
        if (parts[0] === 'notes' && parts[1]?.endsWith('.json')) {
          // Import note metadata
          const content = await zipEntry.async('text');
          const noteData = JSON.parse(content) as Partial<Note>;
          
          // Find corresponding .md file for content
          const mdPath = filePath.replace('.json', '.md');
          if (loadedZip.files[mdPath]) {
            const mdContent = await loadedZip.files[mdPath].async('text');
            noteData.encrypted_body = mdContent;
          }
          
          if (noteData.id && noteData.title) {
            notes.push(noteData as Note);
          }
        } else if (parts[0] === 'notebooks' && parts[1] === 'notebooks.json') {
          // Import notebooks
          const content = await zipEntry.async('text');
          const notebooksData = JSON.parse(content) as Notebook[];
          notebooks.push(...notebooksData);
        } else if (parts[0] === 'tags' && parts[1] === 'tags.json') {
          // Import tags
          const content = await zipEntry.async('text');
          const tagsData = JSON.parse(content) as Tag[];
          tags.push(...tagsData);
        } else if (parts[0] === 'settings' && parts[1] === 'settings.json') {
          // Import settings
          const content = await zipEntry.async('text');
          settings = JSON.parse(content) as UserSettings;
        }
      } catch (err) {
        errors.push(`Error importing ${filePath}: ${(err as Error).message}`);
      }
    });

    await Promise.all(filePromises);
  } catch (err) {
    errors.push(`Failed to read ZIP file: ${(err as Error).message}`);
  }

  return { notes, notebooks, tags, settings, errors };
}

/**
 * Export specific notes
 */
export async function exportNotes(
  selectedNotes: Note[],
  fileName = 'notevo-notes-export'
): Promise<void> {
  const zip = new JSZip();
  const notesFolder = zip.folder('notes')!;

  selectedNotes.forEach((note) => {
    notesFolder.file(`${note.title || note.id}.md`, note.encrypted_body);
    notesFolder.file(
      `${note.title || note.id}.json`,
      JSON.stringify(note, null, 2)
    );
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${fileName}.zip`);
}

/**
 * Validate export data structure
 */
export function validateExportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  return (
    Array.isArray(obj.notes) &&
    Array.isArray(obj.notebooks) &&
    Array.isArray(obj.tags) &&
    typeof obj.export_date === 'string' &&
    typeof obj.version === 'string'
  );
}
