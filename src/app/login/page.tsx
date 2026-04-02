'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: sbError } = await supabase.auth.signInWithPassword({ email, password })
    if (sbError) {
      setError(sbError.message)
      setLoading(false)
    } else {
      router.refresh()
      router.push('/dashboard')
    }
  }

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
        <h1 style={{fontSize:'var(--text-lg)', fontWeight:600, textAlign:'center', marginBottom:'0.375rem', color:'var(--color-text)'}}>Welcome back</h1>
        <p style={{fontSize:'var(--text-sm)', color:'var(--color-text-muted)', textAlign:'center', marginBottom:'2rem'}}>Sign in to your notes</p>

        {error && (
          <div role="alert" style={{background:'var(--color-error-highlight)', border:'1px solid var(--color-error)', color:'var(--color-error)', fontSize:'var(--text-sm)', padding:'0.75rem 1rem', borderRadius:'var(--radius-md)', marginBottom:'1.5rem'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:'1.25rem'}}>
          <div>
            <label style={{display:'block', fontSize:'var(--text-sm)', fontWeight:500, marginBottom:'0.4rem', color:'var(--color-text)'}}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              autoComplete="email" placeholder="you@example.com"
              style={{width:'100%', padding:'0.625rem 0.875rem', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', background:'var(--color-bg)', fontSize:'var(--text-sm)', color:'var(--color-text)', outline:'none', boxSizing:'border-box', transition:'border-color 180ms'}}
              onFocus={e => (e.target.style.borderColor='var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor='var(--color-border)')}
            />
          </div>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'0.4rem'}}>
              <label style={{fontSize:'var(--text-sm)', fontWeight:500, color:'var(--color-text)'}}>Password</label>
              <Link href="/forgot-password" style={{fontSize:'var(--text-xs)', color:'var(--color-primary)'}}>Forgot?</Link>
            </div>
            <div style={{position:'relative'}}>
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} required
                autoComplete="current-password"
                style={{width:'100%', padding:'0.625rem 2.75rem 0.625rem 0.875rem', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', background:'var(--color-bg)', fontSize:'var(--text-sm)', color:'var(--color-text)', outline:'none', boxSizing:'border-box', transition:'border-color 180ms'}}
                onFocus={e => (e.target.style.borderColor='var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor='var(--color-border)')}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)', padding:'0.25rem', lineHeight:1}}>
                {showPw
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%', background:'var(--color-primary)', color:'white', padding:'0.75rem', borderRadius:'var(--radius-lg)', fontSize:'var(--text-sm)', fontWeight:500, border:'none', cursor:loading?'not-allowed':'pointer', opacity:loading?0.65:1, transition:'opacity 180ms', marginTop:'0.25rem'}}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p style={{textAlign:'center', fontSize:'var(--text-sm)', color:'var(--color-text-muted)', marginTop:'1.5rem'}}>
          No account?{' '}
          <Link href="/signup" style={{color:'var(--color-primary)', fontWeight:500}}>Sign up free</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
