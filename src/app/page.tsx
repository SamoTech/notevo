import Link from 'next/link'

const NOTES_PREVIEW = [
  { id: 1, notebook: 'Personal', title: 'Weekend reading list', preview: 'Books to read this weekend: The Pragmatic Programmer, Clean Code...', tag: 'reading', time: '2m ago', pinned: true },
  { id: 2, notebook: 'Work', title: 'Q2 sprint goals', preview: 'Ship the notification system, refactor auth middleware, review PRs...', tag: 'work', time: '1h ago', pinned: false },
  { id: 3, notebook: 'Ideas', title: 'Side project concepts', preview: '1. CLI tool for managing dotfiles  2. Browser extension for...', tag: 'ideas', time: 'Yesterday', pinned: false },
  { id: 4, notebook: 'Personal', title: 'Grocery & errands', preview: 'Milk, bread, olive oil, tomatoes · Return library books by Friday...', tag: 'personal', time: '2d ago', pinned: false },
]

const NOTEBOOKS = [
  { name: 'Personal', count: 12, color: '#4f98a3' },
  { name: 'Work', count: 8, color: '#a12c7b' },
  { name: 'Ideas', count: 5, color: '#e8833a' },
  { name: 'Archive', count: 31, color: '#7a7974' },
]

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-divider)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '3.25rem',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--color-primary)', flexShrink: 0 }}>
            <rect x="4" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M9 10h10M9 14h10M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="20" cy="20" r="5" fill="currentColor" opacity="0.15" />
            <path d="M18 20l1.5 1.5L22 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>Notevo</span>
          <span style={{ fontSize: '0.65rem', background: 'var(--color-primary-hi)', color: 'var(--color-primary)', borderRadius: '4px', padding: '1px 6px', fontWeight: 600, marginLeft: '4px' }}>BETA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="https://github.com/SamoTech/notevo" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}
            className="hover:opacity-70 transition-opacity">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
            GitHub
          </a>
          <Link href="/login" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">Sign in</Link>
          <Link href="/signup" style={{
            background: 'var(--color-primary)', color: 'white',
            fontSize: '0.8rem', fontWeight: 500,
            padding: '0.4rem 1rem', borderRadius: 'var(--radius-lg)',
            textDecoration: 'none',
          }} className="hover:opacity-90 transition-opacity">Get started free →</Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: '780px', margin: '0 auto', padding: '4rem 2rem 2.5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.72rem', color: 'var(--color-text-muted)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-full)', padding: '0.2rem 0.7rem', marginBottom: '1.5rem',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Open source · Zero-knowledge · Laverna successor
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 1.2rem + 2.5vw, 3.2rem)',
          color: 'var(--color-text)', marginBottom: '1rem', lineHeight: 1.1,
        }}>
          Notes that only <em>you</em> can read
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', maxWidth: '44ch', margin: '0 auto 2rem', lineHeight: 1.7 }}>
          AES-GCM encrypted in your browser. Your password never leaves your device. Markdown-first. Open source.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            background: 'var(--color-primary)', color: 'white',
            fontSize: '0.9rem', fontWeight: 500,
            padding: '0.65rem 1.75rem', borderRadius: 'var(--radius-lg)',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          }} className="hover:opacity-90 transition-opacity">
            Start writing free
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          <Link href="/login" style={{
            fontSize: '0.85rem', color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            padding: '0.65rem 1.4rem', borderRadius: 'var(--radius-lg)',
            textDecoration: 'none', background: 'var(--color-surface)',
          }} className="hover:opacity-80 transition-opacity">Sign in</Link>
        </div>
      </section>

      {/* ── App Preview ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          background: 'var(--color-surface)',
        }}>
          {/* Window chrome */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '0.65rem 1rem',
            background: 'var(--color-surface-2)',
            borderBottom: '1px solid var(--color-divider)',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
            <span style={{ flex: 1, textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-faint)' }}>notevo.io — My Notes</span>
          </div>

          {/* 3-pane layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', minHeight: '360px' }}>

            {/* Sidebar */}
            <div style={{
              borderRight: '1px solid var(--color-divider)',
              padding: '1rem 0',
              background: 'var(--color-bg)',
            }}>
              {/* Search */}
              <div style={{ padding: '0 0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.3rem 0.6rem',
                }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="var(--color-text-faint)" strokeWidth="1.5" /><path d="M11 11l2.5 2.5" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)' }}>Search...</span>
                </div>
              </div>
              {/* Nav items */}
              {[{ label: 'All Notes', icon: '📋', active: true }, { label: 'Starred', icon: '⭐' }, { label: 'Trash', icon: '🗑' }].map(item => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  color: item.active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  background: item.active ? 'var(--color-primary-hi)' : 'transparent',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  marginRight: '0.5rem',
                  cursor: 'default',
                }}>
                  <span style={{ fontSize: '0.8rem' }}>{item.icon}</span> {item.label}
                </div>
              ))}
              <div style={{ padding: '0.75rem 0.75rem 0.25rem', fontSize: '0.65rem', color: 'var(--color-text-faint)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.5rem' }}>Notebooks</div>
              {NOTEBOOKS.map(nb => (
                <div key={nb.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.72rem',
                  color: 'var(--color-text-muted)',
                  cursor: 'default',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: nb.color, display: 'inline-block', flexShrink: 0 }} />
                    {nb.name}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-faint)' }}>{nb.count}</span>
                </div>
              ))}
            </div>

            {/* Notes list */}
            <div style={{
              borderRight: '1px solid var(--color-divider)',
              overflowY: 'auto',
            }}>
              <div style={{
                padding: '0.65rem 0.75rem',
                borderBottom: '1px solid var(--color-divider)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text)' }}>All Notes</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-faint)' }}>56 notes</span>
              </div>
              {NOTES_PREVIEW.map((note, i) => (
                <div key={note.id} style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid var(--color-divider)',
                  background: i === 0 ? 'var(--color-primary-hi)' : 'transparent',
                  cursor: 'default',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: i === 0 ? 'var(--color-primary)' : 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                      {note.pinned && <span style={{ marginRight: '0.3rem' }}>📌</span>}{note.title}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-faint)', flexShrink: 0 }}>{note.time}</span>
                  </div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '100%' }}>{note.preview}</p>
                  <div style={{ marginTop: '0.35rem' }}>
                    <span style={{
                      fontSize: '0.6rem', color: 'var(--color-primary)',
                      background: 'var(--color-primary-hi)',
                      borderRadius: 'var(--radius-full)', padding: '1px 6px',
                    }}>{note.notebook}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Editor pane */}
            <div style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['B', 'I', 'H', '`', '⇥'].map(t => (
                    <span key={t} style={{
                      fontSize: '0.7rem', color: 'var(--color-text-muted)',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1px 6px', cursor: 'default',
                    }}>{t}</span>
                  ))}
                </div>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-faint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" /><path d="M6 5h4M6 8h4M6 11h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                  Markdown
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Weekend reading list</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                <p style={{ color: 'var(--color-text-faint)', fontSize: '0.65rem', marginBottom: '0.5rem' }}>## Books to read this weekend</p>
                <p>📚 <strong style={{ color: 'var(--color-text)' }}>The Pragmatic Programmer</strong> — chapters 4–6</p>
                <p>🔒 <strong style={{ color: 'var(--color-text)' }}>Clean Code</strong> — finish chapter 12</p>
                <p style={{ color: 'var(--color-text-faint)', fontSize: '0.65rem', margin: '0.5rem 0' }}>## Articles</p>
                <p>→ <span style={{ color: 'var(--color-primary)' }}>Why your password manager is the first line of defense</span></p>
                <p>→ Supabase RLS deep dive — bookmark saved</p>
                <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', borderLeft: '2px solid var(--color-primary)', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                  &ldquo;A note is only as useful as how fast you can find it.&rdquo;
                </div>
              </div>
              {/* Lock badge */}
              <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.62rem', color: 'var(--color-primary)', background: 'var(--color-primary-hi)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                AES-GCM encrypted
              </div>
            </div>

          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--color-text-faint)', marginTop: '0.75rem' }}>↑ This is what your workspace looks like inside Notevo</p>
      </section>

      {/* ── Feature Cards ───────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--color-divider)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 1rem + 1.2vw, 2rem)', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Everything you need, nothing you don&apos;t</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '40ch', margin: '0 auto' }}>Built for people who care about privacy — not for people who want another SaaS subscription.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🔐', title: 'Zero-knowledge encryption', desc: 'AES-GCM with PBKDF2. 100k iterations. Your key never touches our servers — ever.', badge: 'Security' },
              { icon: '📝', title: 'Markdown-first editor', desc: 'Live split-pane preview. Headings, code blocks, tables, blockquotes — all rendered instantly.', badge: 'Writing' },
              { icon: '🔖', title: 'Notebooks & tags', desc: 'Organize into notebooks. Tag freely. Full-text search across every note you own.', badge: 'Organize' },
              { icon: '📦', title: 'Laverna importer', desc: 'Paste your old JSON backup. All notes migrate in one click, encryption preserved.', badge: 'Migrate' },
              { icon: '☁️', title: 'Sync via Supabase', desc: 'Notes sync across all your browsers. No native app needed. Works offline too.', badge: 'Sync' },
              { icon: '🛠', title: 'MIT open source', desc: 'Self-host on any VPS. Fork it, audit every line of encryption code, own your data.', badge: 'Open' },
            ].map(f => (
              <div key={f.title} style={{
                padding: '1.25rem',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                transition: 'box-shadow var(--transition-interactive)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>{f.icon}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--color-text-faint)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '1px 7px' }}>{f.badge}</span>
                </div>
                <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '100%' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────── */}
      <section style={{ padding: '0 1.5rem 5rem' }}>
        <div style={{
          maxWidth: '700px', margin: '0 auto',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 0.9rem + 1vw, 1.75rem)', color: 'var(--color-text)', marginBottom: '0.75rem' }}>Your notes. Your encryption key. Full stop.</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '38ch', margin: '0 auto 1.75rem', lineHeight: 1.7 }}>No account required to try. No credit card. No tracking. Just private notes the way they should be.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              background: 'var(--color-primary)', color: 'white',
              fontSize: '0.875rem', fontWeight: 500,
              padding: '0.65rem 1.75rem', borderRadius: 'var(--radius-lg)',
              textDecoration: 'none',
            }} className="hover:opacity-90 transition-opacity">Create free account</Link>
            <a href="https://github.com/SamoTech/notevo" target="_blank" rel="noopener noreferrer" style={{
              fontSize: '0.875rem', color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              padding: '0.65rem 1.4rem', borderRadius: 'var(--radius-lg)',
              textDecoration: 'none', background: 'var(--color-bg)',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            }} className="hover:opacity-80 transition-opacity">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
              View source
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--color-divider)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
          <svg width="14" height="14" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--color-primary)' }}>
            <rect x="4" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M9 10h10M9 14h10M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Notevo · MIT License
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          {[{ label: 'About', href: '/about' }, { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }, { label: 'Sponsor', href: '/sponsor' }, { label: 'GitHub', href: 'https://github.com/SamoTech/notevo' }].map(l => (
            <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              style={{ fontSize: '0.72rem', color: 'var(--color-text-faint)', textDecoration: 'none' }}
              className="hover:opacity-70 transition-opacity">{l.label}</a>
          ))}
        </div>
      </footer>

    </main>
  )
}
