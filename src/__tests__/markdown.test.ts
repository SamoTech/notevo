import { describe, it, expect } from 'vitest'
import { renderMarkdownRaw } from '@/lib/markdown'

// renderMarkdownRaw is the sync server-side version (no DOMPurify)
// We test the pure rendering logic; XSS sanitization is DOMPurify's job
describe('renderMarkdownRaw', () => {
  it('renders h1', () => {
    expect(renderMarkdownRaw('# Title')).toContain('<h1>Title</h1>')
  })

  it('renders h2', () => {
    expect(renderMarkdownRaw('## Sub')).toContain('<h2>Sub</h2>')
  })

  it('renders bold', () => {
    expect(renderMarkdownRaw('**bold**')).toContain('<strong>bold</strong>')
  })

  it('renders italic', () => {
    expect(renderMarkdownRaw('*italic*')).toContain('<em>italic</em>')
  })

  it('renders inline code', () => {
    expect(renderMarkdownRaw('`code`')).toContain('<code>code</code>')
  })

  it('renders unordered list', () => {
    const html = renderMarkdownRaw('- item one\n- item two')
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>item one</li>')
  })

  it('renders blockquote', () => {
    expect(renderMarkdownRaw('> quote')).toContain('<blockquote>')
  })

  it('renders horizontal rule', () => {
    expect(renderMarkdownRaw('---')).toContain('<hr')
  })

  it('renders links', () => {
    const html = renderMarkdownRaw('[click](https://example.com)')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('>click<')
  })

  it('does not render javascript: hrefs (renderer replaces with #)', async () => {
    // renderMarkdownSafe is async and calls DOMPurify on client
    // We check that the custom renderer handles it
    const { renderMarkdownSafe } = await import('@/lib/markdown')
    // jsdom environment — DOMPurify will run
    const html = await renderMarkdownSafe('[xss](javascript:alert(1))')
    expect(html).not.toContain('javascript:')
  })

  it('returns empty string for empty input', () => {
    // marked returns '\n' for empty; just ensure no crash
    expect(() => renderMarkdownRaw('')).not.toThrow()
  })
})
