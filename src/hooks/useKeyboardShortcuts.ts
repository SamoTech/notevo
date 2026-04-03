'use client';
// src/hooks/useKeyboardShortcuts.ts
import { useEffect, useRef } from 'react';

export interface ShortcutHandlers {
  onNewNote?: () => void;
  onSave?: () => void;
  onSearch?: () => void;
  onTogglePreview?: () => void;
  onToggleFullscreen?: () => void;
  onShowShortcuts?: () => void;
  onDelete?: () => void;
  onEscape?: () => void;
}

/**
 * Registers global keyboard shortcuts.
 * Uses a ref for handlers to avoid re-registering listeners on every render.
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const h = handlersRef.current;

      // Don't fire shortcuts when typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName;
      const isEditing = tag === 'TEXTAREA' || tag === 'INPUT';

      if (mod && e.key === 'n') { e.preventDefault(); h.onNewNote?.(); }
      if (mod && e.key === 's') { e.preventDefault(); h.onSave?.(); }
      if (mod && e.key === 'k') { e.preventDefault(); h.onSearch?.(); }
      if (mod && e.key === 'p') { e.preventDefault(); h.onTogglePreview?.(); }
      if (mod && e.shiftKey && e.key === 'F') { e.preventDefault(); h.onToggleFullscreen?.(); }
      if (!isEditing && e.key === '?') { h.onShowShortcuts?.(); }
      if (e.key === 'Escape') { h.onEscape?.(); }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
