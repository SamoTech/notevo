import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Support Notevo – Keep it Free Forever',
  description: 'Notevo is free for everyone, forever. If it helps you, consider sponsoring to cover hosting costs and keep it ad-free for all users.',
}

const tiers = [
  {
    label: 'Coffee',
    price: '$3',
    period: '',
    desc: 'Buy us a coffee. Every cup fuels a bug fix or a new feature.',
    cta: 'Buy a coffee ☕',
    href: 'https://github.com/sponsors/SamoTech',
    featured: false,
  },
  {
    label: 'Monthly',
    price: '$5',
    period: '/mo',
    desc: 'Help cover server costs and keep all current and future features free for everyone.',
    cta: 'Sponsor ❤️',
    href: 'https://github.com/sponsors/SamoTech',
    featured: true,
    badge: 'Most Popular',
  },
  {
    label: 'Patron',
    price: '$20',
    period: '/mo',
    desc: 'Your name in the README and our deepest, heartfelt gratitude.',
    cta: 'Become a Patron 🌟',
    href: 'https://github.com/sponsors/SamoTech',
    featured: false,
  },
]

export default function SponsorPage() {
  return (
    <main className="legal-page">
      <div className="legal-container">

        <div className="sponsor-hero">
          <div className="sponsor-heart">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h1>Notevo is free — and will stay free forever</h1>
          <p>We believe everyone deserves private, encrypted notes at no cost. But building and maintaining quality software takes real time and money. If Notevo has been useful to you, a small contribution makes a meaningful difference.</p>
        </div>

        <div className="highlight-box">
          <p>💡 <strong>Where your money goes:</strong> hosting costs, domain renewal, Supabase infrastructure, development time, and keeping Notevo 100% ad-free and tracker-free for every user on Earth.</p>
        </div>

        <div className="sponsor-tiers">
          {tiers.map((tier) => (
            <div key={tier.label} className={`sponsor-tier${tier.featured ? ' sponsor-tier-featured' : ''}`}>
              {tier.badge && <span className="sponsor-badge">{tier.badge}</span>}
              <div className="tier-label">{tier.label}</div>
              <div className="tier-price">
                {tier.price}
                {tier.period && <span className="tier-period">{tier.period}</span>}
              </div>
              <p className="tier-desc">{tier.desc}</p>
              <a
                href={tier.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`tier-btn${tier.featured ? '' : ' tier-btn-outline'}`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="highlight-box">
          <p>🙏 <strong>Can&apos;t sponsor right now?</strong> That&apos;s completely fine — Notevo will always be free, no strings attached. You can still help enormously by ⭐ starring the project on <a href="https://github.com/SamoTech/notevo" target="_blank" rel="noopener noreferrer">GitHub</a>, sharing it with a friend who values privacy, or leaving a kind word.</p>
        </div>

        <div className="sponsor-promise">
          <p>Notevo will <strong>never</strong> show ads, sell your data, lock features behind a paywall, or become a subscription product — no matter what. This is a promise, not a marketing line.</p>
          <p>Thank you for being part of this community. 💚</p>
        </div>

        <div className="legal-footer-links">
          <Link href="/about">About Notevo</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <a href="https://github.com/SamoTech/notevo" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <Link href="/">← Back to app</Link>
        </div>
      </div>
    </main>
  )
}
