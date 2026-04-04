'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'notevo_cookie_ok'

/** Dispatch a custom event so AnalyticsProvider reacts immediately. */
function broadcastConsent(accepted: boolean) {
  window.dispatchEvent(
    new CustomEvent('notevo:consent', { detail: { accepted } })
  )
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY)
      if (!accepted) {
        // Small delay for polish — let the page render first
        const t = setTimeout(() => setVisible(true), 600)
        return () => clearTimeout(t)
      }
    } catch {
      // localStorage blocked (private mode, sandboxed iframe)
    }
  }, [])

  const dismiss = (accepted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, accepted ? 'yes' : 'declined')
    } catch { /* noop */ }
    broadcastConsent(accepted)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="cookie-banner"
    >
      <p>
        🍪 Notevo uses only <strong>localStorage</strong> — your notes stay on your device.
        No tracking, no ads, no servers.{' '}
        <Link href="/cookies">Learn more</Link>
      </p>
      <div className="cookie-actions">
        <button
          onClick={() => dismiss(false)}
          className="cookie-btn-decline"
          aria-label="Decline optional cookies"
        >
          Decline optional
        </button>
        <button
          onClick={() => dismiss(true)}
          className="cookie-btn-accept"
          aria-label="Accept and dismiss cookie notice"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
