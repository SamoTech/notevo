import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{background: 'var(--color-bg)'}}>
      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-black/5">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Notevo logo">
            <rect width="28" height="28" rx="7" fill="#01696f"/>
            <path d="M7 8h14M7 13h10M7 18h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="21" cy="18" r="4" fill="#0f3638" stroke="white" strokeWidth="1.5"/>
            <path d="M21 16.5v1.5l1 1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-xl font-serif">Notevo</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link href="/login" className="text-sm bg-teal-600 text-white px-4 py-1.5 rounded-lg hover:bg-teal-700 transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-sm text-teal-700 mb-8">
          <span>🔐</span> AES-256-GCM encrypted in your browser
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-light text-gray-900 mb-6 max-w-3xl leading-tight">
          Notes that are
          <em className="not-italic text-teal-600"> actually </em>
          private
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mb-10 leading-relaxed">
          Notevo encrypts your notes before they leave your browser. Syncs across devices. Even we cannot read them.
        </p>
        <div className="flex gap-4 flex-col sm:flex-row">
          <Link
            href="/login"
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-8 rounded-xl text-base transition-colors shadow-lg shadow-teal-100"
          >
            Start writing for free
          </Link>
          <a
            href="https://github.com/SamoTech/notevo"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 hover:border-gray-400 text-gray-700 font-medium py-3 px-8 rounded-xl text-base transition-colors"
          >
            View on GitHub →
          </a>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl text-left">
          {[
            { icon: '🔐', title: 'Zero-knowledge', desc: 'AES-256-GCM + PBKDF2. Password never leaves your device.' },
            { icon: '📝', title: 'Markdown editor', desc: 'Full Markdown with live preview, code highlighting, and tables.' },
            { icon: '🔄', title: 'Multi-device sync', desc: 'Encrypted notes sync instantly across all your devices.' },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-6 text-sm text-gray-400 border-t border-black/5">
        Built by <a href="https://github.com/SamoTech" className="hover:text-gray-600" target="_blank" rel="noopener noreferrer">Ossama Hashim</a>
        {' · '}
        <a href="https://github.com/SamoTech/notevo" className="hover:text-gray-600" target="_blank" rel="noopener noreferrer">Open source</a>
        {' · '}
        Inspired by <a href="https://github.com/Laverna/laverna" className="hover:text-gray-600" target="_blank" rel="noopener noreferrer">Laverna</a>
      </footer>
    </main>
  )
}
