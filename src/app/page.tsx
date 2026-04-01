import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen" style={{background: 'var(--color-bg)'}}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{borderColor: 'var(--color-divider)'}}>
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Notevo" style={{color: 'var(--color-primary)'}}>
            <rect x="4" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M9 10h10M9 14h10M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="20" cy="20" r="5" fill="currentColor" opacity="0.15"/>
            <path d="M18 20l1.5 1.5L22 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text)'}}>Notevo</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" style={{fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)'}} className="hover:opacity-80 transition-opacity">Sign in</Link>
          <Link href="/signup" style={{background: 'var(--color-primary)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 500, padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-lg)'}} className="hover:opacity-90 transition-opacity">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 pt-24 pb-20 text-center">
        <div style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '0.25rem 0.75rem', marginBottom: '2rem'}}>
          <span style={{width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block'}} />
          Open source · Self-hostable · Laverna successor
        </div>
        <h1 style={{fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)', marginBottom: '1.5rem', lineHeight: 1.1}}>
          Notes that only<br/><em>you</em> can read
        </h1>
        <p style={{fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: '42ch', margin: '0 auto 2.5rem', lineHeight: 1.7}}>
          AES-GCM encrypted in your browser. Your password never leaves your device. Markdown. Open source.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" style={{background: 'var(--color-primary)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 500, padding: '0.75rem 2rem', borderRadius: 'var(--radius-lg)'}} className="hover:opacity-90 transition-opacity">Start writing free</Link>
          <a href="https://github.com/SamoTech/notevo" target="_blank" rel="noopener noreferrer" style={{fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem'}} className="hover:opacity-80 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            View source
          </a>
        </div>
      </section>

      {/* Features */}
      <section style={{borderTop: '1px solid var(--color-divider)', paddingTop: '4rem', paddingBottom: '5rem'}}>
        <div className="max-w-4xl mx-auto px-8">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem'}}>
            {[
              { icon: '🔐', title: 'Zero-knowledge encryption', desc: 'AES-GCM with PBKDF2 key derivation. 100,000 iterations. Your key never touches our servers.' },
              { icon: '📝', title: 'Full Markdown', desc: 'Headings, bold, italic, code blocks, links. Live preview split-pane. Write naturally.' },
              { icon: '🔖', title: 'Notebooks & tags', desc: 'Organize notes into notebooks. Tag freely. Instant search across all your notes.' },
              { icon: '📦', title: 'Import from Laverna', desc: 'Paste your old Laverna JSON backup. All notes migrate in one click.' },
              { icon: '☁️', title: 'Sync across devices', desc: 'Notes sync via Supabase. Access from any browser. No native app needed.' },
              { icon: '🛠', title: 'Open source', desc: 'MIT licensed. Self-host on any VPS. Fork it, audit it, own it.' },
            ].map(f => (
              <div key={f.title} style={{padding: '1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid oklch(from var(--color-text) l c h / 0.06)'}}>
                <div style={{fontSize: '1.5rem', marginBottom: '0.75rem'}}>{f.icon}</div>
                <h3 style={{fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem'}}>{f.title}</h3>
                <p style={{fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '100%'}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{borderTop: '1px solid var(--color-divider)', padding: '2rem', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)'}}>
        Notevo — MIT License — <a href="https://github.com/SamoTech/notevo" target="_blank" rel="noopener noreferrer" style={{color: 'var(--color-primary)'}}>GitHub</a>
      </footer>
    </main>
  )
}
