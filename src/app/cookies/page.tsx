import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie & Storage Policy – Notevo',
  description: 'Notevo uses no tracking cookies. Only localStorage for your notes. Full cookie policy.',
}

export default function CookiesPage() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Cookie &amp; Storage Policy</h1>
          <p className="legal-meta">Last updated: April 2026</p>
        </div>

        <div className="highlight-box">
          <p>🍪 <strong>No tracking cookies. Ever.</strong> Notevo uses only localStorage for your notes and a session cookie for authentication. There are no advertising cookies, analytics cookies, or cross-site trackers of any kind.</p>
        </div>

        <h2>What We Store Locally</h2>
        <p>Notevo uses browser <strong>localStorage</strong> (not cookies) to store two things:</p>
        <ul>
          <li><code>notevo_notes</code> — your notes (plain or AES-256-GCM encrypted) stored entirely on your device</li>
          <li><code>notevo_cookie_ok</code> — a single flag remembering that you dismissed this banner</li>
        </ul>

        <h2>Authentication Cookie</h2>
        <p>If you sign in, Supabase sets a secure, HTTP-only session cookie to maintain your login. This cookie contains only a session token — no personal data, no tracking identifiers. It expires when you sign out or after your session timeout.</p>

        <h2>What We Don&apos;t Use</h2>
        <ul>
          <li>❌ No advertising / tracking cookies</li>
          <li>❌ No analytics (Google Analytics, Mixpanel, Plausible, etc.)</li>
          <li>❌ No cross-site fingerprinting or device fingerprinting</li>
          <li>❌ No third-party marketing pixels</li>
          <li>❌ No persistent identifiers beyond your auth session</li>
        </ul>

        <h2>Third-Party Resources</h2>
        <p>On page load, Notevo fetches fonts from Google Fonts and may load scripts from CDN services. These services may log your IP address in their own server logs per their respective privacy policies. They do not set cookies in Notevo&apos;s context.</p>

        <h2>Clearing Your Data</h2>
        <p>You can clear all locally stored notes at any time from the app settings. You can also clear all browser storage via your browser&apos;s developer tools under <strong>Application → Local Storage</strong>. Signing out clears your auth session cookie.</p>

        <h2>GDPR / CCPA / PECR Compliance</h2>
        <p>Because Notevo stores no personal data on our servers and uses no tracking or advertising cookies, it is inherently compliant with GDPR, CCPA, and PECR for its core functionality. The auth session cookie is strictly necessary and exempt from consent requirements under these regulations.</p>

        <h2>Contact</h2>
        <p>Questions about storage or cookies? Open an issue on <a href="https://github.com/SamoTech/notevo" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>

        <div className="legal-footer-links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/about">About</Link>
          <Link href="/">← Back to app</Link>
        </div>
      </div>
    </main>
  )
}
