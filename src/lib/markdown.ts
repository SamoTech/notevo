// src/lib/markdown.ts
import { marked, type Renderer } from 'marked';

/**
 * Allowlist of URL schemes that are safe to render as href values.
 * javascript:, data:, and vbscript: can all execute code in a browser
 * and must never appear in rendered output.
 *
 * The check is case-insensitive and strips leading whitespace/control
 * chars that browsers silently normalise before interpreting the URL.
 */
const SAFE_URL_SCHEME = /^(https?|mailto|ftp|tel):/i;

// Matches ASCII control characters U+0000–U+001F.
// Written as a Unicode escape range to avoid triggering no-control-regex.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001F]/g;

function sanitizeHref(href: string): string {
  // Normalise: trim whitespace and remove ASCII control characters
  // that some browsers strip before parsing the scheme.
  const normalised = href.replace(CONTROL_CHARS, '').trim();
  return SAFE_URL_SCHEME.test(normalised) || normalised.startsWith('#') || normalised.startsWith('/') ? href : '#';
}

/**
 * Renders Markdown to sanitized HTML.
 * DOMPurify only runs client-side; server returns raw marked output.
 */
export async function renderMarkdownSafe(content: string): Promise<string> {
  const renderer: Partial<Renderer> = {
    // marked v5+: link renderer receives positional args (href, title, text)
    link(href: string, title: string | null | undefined, text: string): string {
      const safeHref = sanitizeHref(href);
      return `<a href="${safeHref}" title="${title ?? ''}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    },
  };

  marked.use({ renderer });

  const raw = await marked.parse(content, { gfm: true, breaks: true });

  if (typeof window === 'undefined') return raw;

  const DOMPurify = (await import('dompurify')).default;
  return DOMPurify.sanitize(raw, {
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

/**
 * Synchronous version — no sanitization.
 * Use only in server contexts where DOMPurify is unavailable
 * and the output will not be rendered as innerHTML.
 */
export function renderMarkdownRaw(content: string): string {
  return marked.parse(content, { gfm: true, breaks: true }) as string;
}
