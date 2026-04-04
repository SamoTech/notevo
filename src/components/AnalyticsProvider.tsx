'use client'
/**
 * AnalyticsProvider
 *
 * Mounts Vercel Analytics only after the user has accepted cookies.
 * Uses the @vercel/analytics beforeSend hook to honour consent
 * dynamically: if the user later declines, events are dropped.
 *
 * The component listens for a custom 'notevo:consent' event dispatched
 * by CookieBanner so it reacts immediately without a page reload.
 */
import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'

const STORAGE_KEY = 'notevo_cookie_ok'

function hasConsent(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'yes'
  } catch {
    return false
  }
}

export default function AnalyticsProvider() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    // Initialise from stored preference on mount.
    setConsented(hasConsent())

    // React to real-time consent changes from CookieBanner.
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ accepted: boolean }>).detail
      setConsented(detail.accepted)
    }
    window.addEventListener('notevo:consent', handler)
    return () => window.removeEventListener('notevo:consent', handler)
  }, [])

  if (!consented) return null

  return (
    <Analytics
      // beforeSend is a final safety net: re-check consent on every event
      // in case localStorage was cleared between renders.
      beforeSend={() => (hasConsent() ? undefined : null)}
    />
  )
}
