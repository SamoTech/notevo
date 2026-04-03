/**
 * Keyboard Shortcuts / Keybindings System
 * Laverna feature: Customizable keyboard shortcuts
 */

export type KeybindingAction =
  | 'new-note'
  | 'save-note'
  | 'delete-note'
  | 'toggle-preview'
  | 'toggle-distraction-free'
  | 'search'
  | 'toggle-sidebar'
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'code-block'
  | 'link'
  | 'quote'
  | 'unordered-list'
  | 'ordered-list'
  | 'checkbox'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3';

export interface Keybinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: KeybindingAction;
  description: string;
}

export type KeybindingsPreset = 'default' | 'vim' | 'emacs';

// Default keybindings (Laverna-inspired)
export const DEFAULT_KEYBINDINGS: Keybinding[] = [
  { key: 'n', ctrl: true, action: 'new-note', description: 'New note' },
  { key: 's', ctrl: true, action: 'save-note', description: 'Save note' },
  { key: 'd', ctrl: true, shift: true, action: 'delete-note', description: 'Delete note' },
  { key: 'e', ctrl: true, action: 'toggle-preview', description: 'Toggle preview' },
  { key: 'f', ctrl: true, action: 'toggle-distraction-free', description: 'Distraction-free mode' },
  { key: 'f', ctrl: true, shift: true, action: 'search', description: 'Search notes' },
  { key: 'b', ctrl: true, action: 'toggle-sidebar', description: 'Toggle sidebar' },
  { key: 'b', ctrl: true, action: 'bold', description: 'Bold text' },
  { key: 'i', ctrl: true, action: 'italic', description: 'Italic text' },
  { key: 'k', ctrl: true, action: 'link', description: 'Insert link' },
  { key: 'q', ctrl: true, action: 'quote', description: 'Blockquote' },
  { key: 'u', ctrl: true, action: 'unordered-list', description: 'Unordered list' },
  { key: 'o', ctrl: true, action: 'ordered-list', description: 'Ordered list' },
  { key: '1', ctrl: true, alt: true, action: 'heading-1', description: 'Heading 1' },
  { key: '2', ctrl: true, alt: true, action: 'heading-2', description: 'Heading 2' },
  { key: '3', ctrl: true, alt: true, action: 'heading-3', description: 'Heading 3' },
];

// Vim-style keybindings
export const VIM_KEYBINDINGS: Keybinding[] = [
  { key: 'n', ctrl: true, action: 'new-note', description: 'New note' },
  { key: 's', ctrl: true, action: 'save-note', description: 'Save note' },
  { key: 'd', ctrl: true, action: 'delete-note', description: 'Delete note' },
  { key: 'v', ctrl: true, action: 'toggle-preview', description: 'Toggle preview' },
  { key: 'f', ctrl: true, action: 'toggle-distraction-free', description: 'Distraction-free mode' },
  { key: '/', ctrl: true, action: 'search', description: 'Search notes' },
  { key: 'b', ctrl: true, action: 'toggle-sidebar', description: 'Toggle sidebar' },
  { key: 'b', ctrl: true, action: 'bold', description: 'Bold text' },
  { key: 'i', ctrl: true, action: 'italic', description: 'Italic text' },
  { key: 'k', ctrl: true, action: 'link', description: 'Insert link' },
  { key: '>', ctrl: true, action: 'quote', description: 'Blockquote' },
  { key: '-', ctrl: true, action: 'unordered-list', description: 'Unordered list' },
  { key: '1', ctrl: true, action: 'ordered-list', description: 'Ordered list' },
];

// Emacs-style keybindings
export const EMACS_KEYBINDINGS: Keybinding[] = [
  { key: 'n', ctrl: true, action: 'new-note', description: 'New note' },
  { key: 's', ctrl: true, action: 'save-note', description: 'Save note' },
  { key: 'k', ctrl: true, action: 'delete-note', description: 'Delete note' },
  { key: 'p', ctrl: true, action: 'toggle-preview', description: 'Toggle preview' },
  { key: 'x', ctrl: true, action: 'toggle-distraction-free', description: 'Distraction-free mode' },
  { key: 's', ctrl: true, shift: true, action: 'search', description: 'Search notes' },
  { key: 'x', ctrl: true, shift: true, action: 'toggle-sidebar', description: 'Toggle sidebar' },
  { key: 'b', ctrl: true, action: 'bold', description: 'Bold text' },
  { key: 'i', ctrl: true, action: 'italic', description: 'Italic text' },
  { key: 'l', ctrl: true, action: 'link', description: 'Insert link' },
  { key: 'q', ctrl: true, action: 'quote', description: 'Blockquote' },
  { key: 'u', ctrl: true, action: 'unordered-list', description: 'Unordered list' },
  { key: 'o', ctrl: true, action: 'ordered-list', description: 'Ordered list' },
];

export function getKeybindingsForPreset(preset: KeybindingsPreset): Keybinding[] {
  switch (preset) {
    case 'vim':
      return VIM_KEYBINDINGS;
    case 'emacs':
      return EMACS_KEYBINDINGS;
    default:
      return DEFAULT_KEYBINDINGS;
  }
}

export function eventMatchesKeybinding(
  event: KeyboardEvent,
  keybinding: Keybinding
): boolean {
  // Check modifier keys
  if (event.ctrlKey !== !!keybinding.ctrl) return false;
  if (event.shiftKey !== !!keybinding.shift) return false;
  if (event.altKey !== !!keybinding.alt) return false;
  if (event.metaKey !== !!keybinding.meta) return false;

  // Check key (case-insensitive)
  return event.key.toLowerCase() === keybinding.key.toLowerCase();
}

export function findKeybindingByAction(
  keybindings: Keybinding[],
  action: KeybindingAction
): Keybinding | undefined {
  return keybindings.find(kb => kb.action === action);
}

export function formatKeybinding(keybinding: Keybinding): string {
  const parts: string[] = [];

  if (keybinding.ctrl) parts.push('Ctrl');
  if (keybinding.shift) parts.push('Shift');
  if (keybinding.alt) parts.push('Alt');
  if (keybinding.meta) parts.push('Meta');

  parts.push(keybinding.key.toUpperCase());

  return parts.join('+');
}

/**
 * Hook-like function to register global keybindings
 */
export function registerGlobalKeybindings(
  keybindings: Keybinding[],
  handlers: Partial<Record<KeybindingAction, () => void>>
): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignore if typing in input/textarea
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow escape key even in inputs
      if (event.key === 'Escape') {
        const escapeHandler = handlers['toggle-distraction-free'];
        if (escapeHandler) {
          event.preventDefault();
          escapeHandler();
        }
      }
      return;
    }

    for (const keybinding of keybindings) {
      if (eventMatchesKeybinding(event, keybinding)) {
        event.preventDefault();
        const handler = handlers[keybinding.action];
        if (handler) {
          handler();
        }
        break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Get all available actions with descriptions
 */
export function getAvailableActions(): { action: KeybindingAction; description: string }[] {
  return DEFAULT_KEYBINDINGS.map(({ action, description }) => ({ action, description }));
}
