'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: sbError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (sbError) { setError(sbError.message); setLoading(false) }
    else setSent(true)
  }

  if (sent) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--color-bg)', padding:'1rem'}}>
      <div style={{textAlign:'center', maxWidth:360}}>
        <div style={{width:64, height:64, borderRadius:'50%', background:'var(--color-primary)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <h2 style={{fontSize:'var(--text-lg)', fontWeight:600, marginBottom:'0.75rem', color:'var(--color-text)'}}>Reset link sent</h2>
        <p style={{fontSize:'var(--text-sm)', color:'var(--color-text-muted)', lineHeight:1.6}}>
          Check <strong style={{color:'var(--color-text)'}}>{email}</strong> for a password reset link.
        </p>
        <Link href="/login" style={{display:'inline-block', marginTop:'1.5rem', fontSize:'var(--text-sm)', color:'var(--color-primary)', fontWeight:500}}>
          Back to sign in
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--color-bg)', padding:'1rem'}}>
      <Link href="/" style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'2rem', textDecoration:'none'}}>
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none" style={{color:'var(--color-primary)'}}>
          <rect x="4" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M9 10h10M9 14h10M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{fontFamily:'var(--font-display)', fontSize:'var(--text-lg)', color:'var(--color-text)'}}>Notevo</span>
      </Link>

      <div style={{width:'100%', maxWidth:400, background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'2rem 2.5rem'}}>
        <h1 style={{fontSize:'var(--text-lg)', fontWeight:600, textAlign:'center', marginBottom:'0.375rem', color:'var(--color-text)'}}>Reset your password</h1>
        <p style={{fontSize:'var(--text-sm)', color:'var(--color-text-muted)', textAlign:'center', marginBottom:'2rem'}}>Enter your email and we&apos;ll send a reset link.</p>

        {error && (
          <div role="alert" style={{background:'var(--color-error-highlight)', border:'1px solid var(--color-error)', color:'var(--color-error)', fontSize:'var(--text-sm)', padding:'0.75rem 1rem', borderRadius:'var(--radius-md)', marginBottom:'1.5rem'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleReset} style={{display:'flex', flexDirection:'column', gap:'1.25rem'}}>
          <div>
            <label style={{display:'block', fontSize:'var(--text-sm)', fontWeight:500, marginBottom:'0.4rem', color:'var(--color-text)'}}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              autoComplete="email" placeholder="you@example.com"
              style={{width:'100%', padding:'0.625rem 0.875rem', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', background:'var(--color-bg)', fontSize:'var(--text-sm)', color:'var(--color-text)', outline:'none', boxSizing:'border-box', transition:'border-color 180ms'}}
              onFocus={e => (e.target.style.borderColor='var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor='var(--color-border)')}
            />
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%', background:'var(--color-primary)', color:'white', padding:'0.75rem', borderRadius:'var(--radius-lg)', fontSize:'var(--text-sm)', fontWeight:500, border:'none', cursor:loading?'not-allowed':'pointer', opacity:loading?0.65:1}}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p style={{textAlign:'center', fontSize:'var(--text-sm)', color:'var(--color-text-muted)', marginTop:'1.5rem'}}>
          <Link href="/login" style={{color:'var(--color-primary)', fontWeight:500}}>← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
