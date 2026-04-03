'use client';
// src/app/dashboard/settings/page.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useSettings } from '@/hooks/useSettings';
import { useTags } from '@/hooks/useTags';
import type { UserSettings } from '@/lib/types';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'zh', label: '中文' },
];

const TAG_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444',
  '#f97316','#eab308','#22c55e','#06b6d4','#3b82f6',
];

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<'general' | 'editor' | 'tags' | 'import-export'>('general');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [tagError, setTagError] = useState('');
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [importMsg, setImportMsg] = useState('');

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { settings, loading, update } = useSettings(userId);
  const { tags, addTag, editTag, removeTag } = useTags(userId);

  const set = (fields: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) =>
    update(fields);

  async function handleExport() {
    setExportStatus('loading');
    try {
      const { exportAllData } = await import('@/lib/import-export');
      const blob = await exportAllData(userId!);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notevo-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('done');
    } catch {
      setExportStatus('error');
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setImportStatus('loading');
    setImportMsg('');
    try {
      const { importFromZip } = await import('@/lib/import-export');
      const result = await importFromZip(file, userId);
      setImportMsg(result.message);
      setImportStatus(result.success ? 'done' : 'error');
    } catch (err) {
      setImportMsg(String(err));
      setImportStatus('error');
    }
    e.target.value = '';
  }

  async function handleAddTag() {
    if (!newTagName.trim()) { setTagError('Tag name is required'); return; }
    try {
      await addTag(newTagName.trim(), newTagColor);
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
      setTagError('');
    } catch {
      setTagError('Tag already exists or could not be created');
    }
  }

  if (loading || !settings) {
    return (
      <div className="settings-page">
        <div className="settings-loading">Loading settings…</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      {/* Tabs */}
      <div className="settings-tabs" role="tablist">
        {(['general', 'editor', 'tags', 'import-export'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`settings-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'import-export' ? 'Import / Export' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* General */}
      {tab === 'general' && (
        <section className="settings-section">
          <div className="settings-row">
            <label className="settings-label">Theme</label>
            <select
              className="settings-select"
              value={settings.theme}
              onChange={(e) => set({ theme: e.target.value as UserSettings['theme'] })}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="settings-row">
            <label className="settings-label">Language</label>
            <select
              className="settings-select"
              value={settings.language}
              onChange={(e) => set({ language: e.target.value })}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="settings-row">
            <label className="settings-label">Auto-save</label>
            <input
              type="checkbox"
              className="settings-checkbox"
              checked={settings.auto_save}
              onChange={(e) => set({ auto_save: e.target.checked })}
            />
          </div>
        </section>
      )}

      {/* Editor */}
      {tab === 'editor' && (
        <section className="settings-section">
          <div className="settings-row">
            <label className="settings-label">Editor Mode</label>
            <select
              className="settings-select"
              value={settings.editor_mode}
              onChange={(e) => set({ editor_mode: e.target.value as UserSettings['editor_mode'] })}
            >
              <option value="normal">Normal</option>
              <option value="preview">Preview only</option>
              <option value="distraction_free">Distraction-free</option>
            </select>
          </div>

          <div className="settings-row">
            <label className="settings-label">Font Size</label>
            <div className="settings-range-row">
              <input
                type="range" min={10} max={32} step={1}
                className="settings-range"
                value={settings.font_size}
                onChange={(e) => set({ font_size: Number(e.target.value) })}
              />
              <span className="settings-range-value">{settings.font_size}px</span>
            </div>
          </div>

          <div className="settings-row">
            <label className="settings-label">Keybindings</label>
            <select
              className="settings-select"
              value={settings.keybindings_preset}
              onChange={(e) => set({ keybindings_preset: e.target.value as UserSettings['keybindings_preset'] })}
            >
              <option value="default">Default</option>
              <option value="vim">Vim</option>
              <option value="emacs">Emacs</option>
            </select>
          </div>

          <div className="settings-row">
            <label className="settings-label">Syntax Highlighting</label>
            <input
              type="checkbox"
              className="settings-checkbox"
              checked={settings.enable_syntax_highlighting}
              onChange={(e) => set({ enable_syntax_highlighting: e.target.checked })}
            />
          </div>

          <div className="settings-row">
            <label className="settings-label">MathJax (LaTeX)</label>
            <input
              type="checkbox"
              className="settings-checkbox"
              checked={settings.enable_mathjax}
              onChange={(e) => set({ enable_mathjax: e.target.checked })}
            />
          </div>
        </section>
      )}

      {/* Tags */}
      {tab === 'tags' && (
        <section className="settings-section">
          <div className="settings-add-tag">
            <input
              className="settings-input"
              placeholder="New tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <div className="settings-color-swatches">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  className={`color-swatch ${newTagColor === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setNewTagColor(c)}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
            <button className="settings-btn-primary" onClick={handleAddTag}>Add Tag</button>
            {tagError && <p className="settings-error">{tagError}</p>}
          </div>

          {tags.length === 0 ? (
            <p className="settings-empty">No tags yet. Create one above.</p>
          ) : (
            <ul className="settings-tag-list">
              {tags.map((tag) => (
                <li key={tag.id} className="settings-tag-item">
                  <span className="tag-dot" style={{ background: tag.color }} />
                  <span className="tag-name">{tag.name}</span>
                  <div className="tag-actions">
                    {TAG_COLORS.map((c) => (
                      <button
                        key={c}
                        className={`color-swatch sm ${tag.color === c ? 'selected' : ''}`}
                        style={{ background: c }}
                        onClick={() => editTag(tag.id, { color: c })}
                        aria-label={`Set color ${c}`}
                      />
                    ))}
                    <button
                      className="settings-btn-danger"
                      onClick={() => removeTag(tag.id)}
                      aria-label="Delete tag"
                    >✕</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Import / Export */}
      {tab === 'import-export' && (
        <section className="settings-section">
          <div className="settings-ie-block">
            <h3>Export Backup</h3>
            <p>Download all your notes, tags and settings as a ZIP file.</p>
            <button
              className="settings-btn-primary"
              onClick={handleExport}
              disabled={exportStatus === 'loading'}
            >
              {exportStatus === 'loading' ? 'Exporting…' : 'Download ZIP'}
            </button>
            {exportStatus === 'done' && <p className="settings-success">Export complete!</p>}
            {exportStatus === 'error' && <p className="settings-error">Export failed. Please try again.</p>}
          </div>

          <div className="settings-ie-block">
            <h3>Import Backup</h3>
            <p>Restore notes from a Notevo ZIP backup.</p>
            <label className="settings-file-label">
              <span className="settings-btn-secondary">
                {importStatus === 'loading' ? 'Importing…' : 'Choose ZIP file'}
              </span>
              <input
                type="file"
                accept=".zip"
                className="sr-only"
                onChange={handleImport}
                disabled={importStatus === 'loading'}
              />
            </label>
            {importMsg && (
              <p className={importStatus === 'done' ? 'settings-success' : 'settings-error'}>
                {importMsg}
              </p>
            )}
          </div>
        </section>
      )}

      <style>{`
        .settings-page { max-width: 680px; margin: 0 auto; padding: 2rem 1rem; }
        .settings-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
        .settings-loading { padding: 2rem; color: var(--color-text-muted, #888); }
        .settings-tabs { display: flex; gap: 0.25rem; border-bottom: 1px solid var(--color-border, #e5e7eb); margin-bottom: 1.5rem; }
        .settings-tab { padding: 0.5rem 1rem; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; color: var(--color-text-muted, #6b7280); font-size: 0.875rem; transition: all 150ms; }
        .settings-tab.active { color: var(--color-primary, #6366f1); border-bottom-color: var(--color-primary, #6366f1); font-weight: 600; }
        .settings-section { display: flex; flex-direction: column; gap: 1.25rem; }
        .settings-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--color-border, #f3f4f6); }
        .settings-label { font-size: 0.875rem; font-weight: 500; color: var(--color-text, #111); }
        .settings-select { padding: 0.375rem 0.75rem; border: 1px solid var(--color-border, #d1d5db); border-radius: 0.375rem; background: var(--color-surface, #fff); font-size: 0.875rem; }
        .settings-checkbox { width: 1rem; height: 1rem; cursor: pointer; accent-color: var(--color-primary, #6366f1); }
        .settings-range-row { display: flex; align-items: center; gap: 0.75rem; }
        .settings-range { width: 140px; accent-color: var(--color-primary, #6366f1); }
        .settings-range-value { font-size: 0.875rem; min-width: 2.5rem; text-align: right; color: var(--color-text-muted, #6b7280); }
        .settings-input { padding: 0.375rem 0.75rem; border: 1px solid var(--color-border, #d1d5db); border-radius: 0.375rem; font-size: 0.875rem; flex: 1; }
        .settings-add-tag { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid var(--color-border, #f3f4f6); margin-bottom: 1rem; }
        .settings-color-swatches { display: flex; gap: 0.25rem; flex-wrap: wrap; }
        .color-swatch { width: 1.25rem; height: 1.25rem; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 100ms; }
        .color-swatch.selected { border-color: var(--color-text, #111); transform: scale(1.2); }
        .color-swatch.sm { width: 1rem; height: 1rem; }
        .settings-tag-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .settings-tag-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; border-radius: 0.5rem; background: var(--color-surface, #f9fafb); }
        .tag-dot { width: 0.75rem; height: 0.75rem; border-radius: 50%; flex-shrink: 0; }
        .tag-name { font-size: 0.875rem; flex: 1; }
        .tag-actions { display: flex; align-items: center; gap: 0.25rem; }
        .settings-empty { color: var(--color-text-muted, #6b7280); font-size: 0.875rem; }
        .settings-btn-primary { padding: 0.375rem 1rem; background: var(--color-primary, #6366f1); color: #fff; border: none; border-radius: 0.375rem; font-size: 0.875rem; cursor: pointer; white-space: nowrap; }
        .settings-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .settings-btn-secondary { padding: 0.375rem 1rem; background: var(--color-surface, #f3f4f6); border: 1px solid var(--color-border, #d1d5db); border-radius: 0.375rem; font-size: 0.875rem; cursor: pointer; display: inline-block; }
        .settings-btn-danger { padding: 0.25rem 0.5rem; background: transparent; border: 1px solid var(--color-error, #ef4444); color: var(--color-error, #ef4444); border-radius: 0.25rem; font-size: 0.75rem; cursor: pointer; }
        .settings-ie-block { padding: 1.25rem; border: 1px solid var(--color-border, #e5e7eb); border-radius: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
        .settings-ie-block h3 { font-size: 1rem; font-weight: 600; }
        .settings-ie-block p { font-size: 0.875rem; color: var(--color-text-muted, #6b7280); }
        .settings-file-label { cursor: pointer; }
        .settings-success { color: #16a34a; font-size: 0.875rem; }
        .settings-error { color: var(--color-error, #ef4444); font-size: 0.875rem; }
        .sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }
      `}</style>
    </div>
  );
}
