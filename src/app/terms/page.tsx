import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service – Notevo',
  description: 'Terms of Service for Notevo — free, encrypted note-taking for everyone.',
}

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Terms of Service</h1>
          <p className="legal-meta">Last updated: April 2026</p>
        </div>

        <div className="highlight-box">
          <p>✅ <strong>Short version:</strong> Use Notevo freely. Don&apos;t misuse it. We provide it as-is with no warranty. Your notes are your responsibility — back them up.</p>
        </div>

        <h2>1. Acceptance</h2>
        <p>By using Notevo, you agree to these terms. If you don&apos;t agree, please stop using the app.</p>

        <h2>2. Free to Use — Forever</h2>
        <p>Notevo is provided free of charge, forever. You may use it for personal or commercial purposes without restriction. You do not need to pay anything, ever. We will never introduce paywalls for existing features.</p>

        <h2>3. Your Responsibility for Your Data</h2>
        <p>Your notes are stored in your browser&apos;s localStorage or your own Supabase account. <strong>We have no access to them and cannot recover them if you lose your password or clear your browser.</strong> You are solely responsible for backing up your data. Use the Export function regularly.</p>

        <h2>4. Encryption &amp; Passwords</h2>
        <p>Encrypted notes use AES-256-GCM encryption. If you lose the password you used to encrypt a note, that note cannot be recovered — not by you, not by us. There is no password reset for locally-encrypted notes. Keep your passwords safe.</p>

        <h2>5. No Warranty</h2>
        <p>Notevo is provided &quot;as is&quot; without warranty of any kind. We make no guarantee that it will be error-free, uninterrupted, or suitable for any particular purpose. Use it at your own risk.</p>

        <h2>6. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, the Notevo authors shall not be liable for any loss of data, loss of profits, or any other damages arising from your use of the app.</p>

        <h2>7. Prohibited Uses</h2>
        <p>You may not use Notevo to store, transmit, or distribute illegal content, malware, or content that violates applicable laws in your jurisdiction.</p>

        <h2>8. Open Source License</h2>
        <p>Notevo is open source under the <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">MIT License</a>. You are free to fork, modify, and redistribute it in accordance with the license terms. Attribution is required.</p>

        <h2>9. Changes</h2>
        <p>We may update these terms occasionally. Continued use of Notevo after changes constitutes acceptance of the new terms.</p>

        <div className="legal-footer-links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/cookies">Cookie Policy</Link>
          <Link href="/about">About</Link>
          <Link href="/">← Back to app</Link>
        </div>
      </div>
    </main>
  )
}
