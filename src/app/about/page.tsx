import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About – Notevo',
  description: 'Learn about Notevo — the free, private, encrypted note-taking app built for everyone.',
}

export default function AboutPage() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <div className="legal-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M7 8h10M7 12h7M7 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1>About Notevo</h1>
            <p className="legal-subtitle">Version 1.0 · Free &amp; Open Source</p>
          </div>
        </div>

        <div className="highlight-box">
          <p>📝 <strong>Notevo</strong> is a private, encrypted note-taking app. Your notes never leave your device — no surveillance, no account required, no servers storing your thoughts.</p>
        </div>

        <h2>What makes Notevo different?</h2>
        <ul>
          <li><strong>Zero-knowledge encryption</strong> — AES-256-GCM via Web Crypto API. Only you hold the key.</li>
          <li><strong>No account required</strong> — open and use immediately, forever.</li>
          <li><strong>Offline-first</strong> — works without internet after first load.</li>
          <li><strong>Markdown editor</strong> — with live split-pane preview.</li>
          <li><strong>Tags &amp; search</strong> — organised and instantly searchable.</li>
          <li><strong>Import Laverna backups</strong> — migrate from the abandoned Laverna app in one click.</li>
          <li><strong>Export to Markdown</strong> — your notes, your format, always portable.</li>
        </ul>

        <h2>The philosophy</h2>
        <p>Notevo exists because note-taking apps keep getting more complex, more expensive, and more invasive. We believe a notes app should be simple, private, and free — forever.</p>
        <p>Notevo is — and always will be — <strong>100% free</strong>. If it brings you value, consider <Link href="/sponsor">sponsoring the project</Link> to keep the lights on for everyone.</p>

        <h2>Built with</h2>
        <ul>
          <li>Next.js 15 (App Router) + TypeScript</li>
          <li>Supabase — optional cloud sync (encrypted)</li>
          <li>Web Crypto API — native browser AES-256-GCM encryption</li>
          <li>Tailwind CSS — utility-first styling</li>
        </ul>

        <h2>Open Source</h2>
        <p>Notevo is open source under the MIT license. Contributions, bug reports, and feature ideas are welcome on <a href="https://github.com/SamoTech/notevo" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>

        <div className="legal-footer-links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/sponsor">❤️ Sponsor</Link>
          <Link href="/">← Back to app</Link>
        </div>
      </div>
    </main>
  )
}
