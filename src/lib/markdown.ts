// src/lib/markdown.ts
import { marked } from 'marked';

/**
 * Renders Markdown to sanitized HTML.
 * DOMPurify only runs client-side; server returns raw marked output.
 */
export async function renderMarkdownSafe(content: string): Promise<string> {
  const renderer = new marked.Renderer();

  // Open external links safely in new tab
  renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
    const safeHref = href.startsWith('javascript:') ? '#' : href;
    return `<a href="${safeHref}" title="${
      title ?? ''
    }" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  const raw = await marked.parse(content, { renderer, gfm: true, breaks: true });

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
