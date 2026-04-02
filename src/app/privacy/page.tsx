import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy – Notevo',
  description: 'Notevo collects no personal data. Your notes stay in your browser. Full privacy policy.',
}

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="legal-meta">Last updated: April 2026</p>
        </div>

        <div className="highlight-box">
          <p>🔒 <strong>Short version:</strong> Notevo collects absolutely nothing. Your notes are stored only in your browser or — if you opt in — in your own Supabase account. We have no access to them.</p>
        </div>

        <h2>1. Data We Collect</h2>
        <p><strong>None.</strong> Notevo does not collect, transmit, store, or process any personal data on our servers. There are no analytics, no error tracking, no advertising networks, and no telemetry.</p>

        <h2>2. Your Notes</h2>
        <p>Notes are stored either in your browser&apos;s <code>localStorage</code> (offline mode) or in <strong>your own Supabase project</strong> (cloud sync). In both cases, notes are encrypted with AES-256-GCM before leaving your device. The encryption key is derived from your password and never transmitted anywhere.</p>

        <h2>3. Authentication</h2>
        <p>If you create an account, your email and hashed password are stored in Supabase Auth. We use this solely to identify your session. We never see your note contents — only encrypted blobs.</p>

        <h2>4. Cookies &amp; Tracking</h2>
        <p>Notevo does not use tracking cookies, advertising networks, or any third-party analytics. We use a single <code>localStorage</code> flag (<code>notevo_cookie_ok</code>) to remember that you dismissed the cookie banner. Supabase sets a session cookie for authentication only.</p>

        <h2>5. Third-Party Services</h2>
        <ul>
          <li><strong>Supabase</strong> — optional cloud sync. Subject to <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase&apos;s privacy policy</a>.</li>
          <li><strong>Google Fonts</strong> — typography CDN. Google may log font requests.</li>
          <li><strong>Vercel</strong> — hosting. Vercel may log request metadata per their <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">privacy policy</a>.</li>
        </ul>

        <h2>6. Children&apos;s Privacy</h2>
        <p>Notevo does not knowingly collect data from children under 13. Since we collect no personal data, COPPA compliance is inherent to our design.</p>

        <h2>7. Your Rights</h2>
        <p>Under GDPR, CCPA, and similar laws, you have the right to access, correct, or delete your data. Since we hold no personal data, you can exercise these rights entirely on your own — export or delete your notes at any time from within the app. For account deletion, use the settings panel.</p>

        <h2>8. Changes</h2>
        <p>If we ever change this policy in a meaningful way, the &quot;Last updated&quot; date above will reflect it. We will never retroactively reduce your privacy protections.</p>

        <h2>9. Contact</h2>
        <p>Questions? Open an issue on <a href="https://github.com/SamoTech/notevo" target="_blank" rel="noopener noreferrer">GitHub</a> or email <a href="mailto:samo.hossam@gmail.com">samo.hossam@gmail.com</a>.</p>

        <div className="legal-footer-links">
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Policy</Link>
          <Link href="/about">About</Link>
          <Link href="/">← Back to app</Link>
        </div>
      </div>
    </main>
  )
}
