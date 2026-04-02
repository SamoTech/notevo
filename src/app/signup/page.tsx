'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function Signup() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)
  const router = useRouter()

  const strength = password.length === 0 ? 0
    : password.length < 8  ? 1
    : password.length < 12 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', '#ef4444', '#f97316', '#22c55e', '#10b981']

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data, error: sbError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })

      if (sbError) {
        setError(sbError.message)
        setLoading(false)
        return
      }

      // Email confirmations disabled → session returned immediately
      if (data?.session) {
        router.refresh()
        router.push('/dashboard')
        return
      }

      // Supabase already has this email (returns fake success with no session)
      if (data?.user?.identities?.length === 0) {
        setError('An account with this email already exists. Try signing in instead.')
        setLoading(false)
        return
      }

      // Normal flow: confirmation email sent
      setLoading(false)
      setDone(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (done) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--color-bg)', padding:'1rem'}}>
      <div style={{textAlign:'center', maxWidth:360}}>
        <div style={{width:64, height:64, borderRadius:'50%', background:'var(--color-primary)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{fontSize:'var(--text-lg)', fontWeight:600, marginBottom:'0.75rem', color:'var(--color-text)'}}>Check your inbox</h2>
        <p style={{fontSize:'var(--text-sm)', color:'var(--color-text-muted)', lineHeight:1.6}}>
          We sent a confirmation link to{' '}
          <strong style={{color:'var(--color-text)'}}>{email}</strong>.
          Click it to activate your account.
        </p>
        <p style={{fontSize:'var(--text-xs)', color:'var(--color-text-faint)', marginTop:'1rem'}}>
          Didn&apos;t get it? Check spam or{' '}
          <button onClick={() => setDone(false)} style={{color:'var(--color-primary)', background:'none', border:'none', cursor:'pointer', fontSize:'inherit'}}>
            try again
          </button>
        </p>
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
        <h1 style={{fontSize:'var(--text-lg)', fontWeight:600, textAlign:'center', marginBottom:'0.375rem', color:'var(--color-text)'}}>Create your account</h1>
        <p style={{fontSize:'var(--text-sm)', color:'var(--color-text-muted)', textAlign:'center', marginBottom:'2rem'}}>Free forever. No credit card.</p>

        {error && (
          <div role="alert" style={{background:'var(--color-error-highlight)', border:'1px solid var(--color-error)', color:'var(--color-error)', fontSize:'var(--text-sm)', padding:'0.75rem 1rem', borderRadius:'var(--radius-md)', marginBottom:'1.5rem'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{display:'flex', flexDirection:'column', gap:'1.25rem'}}>
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
            <label style={{display:'block', fontSize:'var(--text-sm)', fontWeight:500, marginBottom:'0.4rem', color:'var(--color-text)'}}>Password</label>
            <div style={{position:'relative'}}>
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} required minLength={8}
                autoComplete="new-password" placeholder="Min. 8 characters"
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
            {password.length > 0 && (
              <div style={{marginTop:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                <div style={{flex:1, height:3, background:'var(--color-border)', borderRadius:2, overflow:'hidden'}}>
                  <div style={{height:'100%', width:`${strength * 25}%`, background:strengthColor[strength], transition:'width 300ms, background 300ms', borderRadius:2}}/>
                </div>
                <span style={{fontSize:'var(--text-xs)', color:strengthColor[strength], fontWeight:500, minWidth:40}}>{strengthLabel[strength]}</span>
              </div>
            )}
          </div>

          <div>
            <label style={{display:'block', fontSize:'var(--text-sm)', fontWeight:500, marginBottom:'0.4rem', color:'var(--color-text)'}}>Confirm password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              autoComplete="new-password" placeholder="Repeat your password"
              style={{width:'100%', padding:'0.625rem 0.875rem', border:`1px solid ${confirm && confirm !== password ? 'var(--color-error)' : 'var(--color-border)'}`, borderRadius:'var(--radius-md)', background:'var(--color-bg)', fontSize:'var(--text-sm)', color:'var(--color-text)', outline:'none', boxSizing:'border-box', transition:'border-color 180ms'}}
              onFocus={e => (e.target.style.borderColor='var(--color-primary)')}
              onBlur={e => { if (!confirm || confirm === password) e.target.style.borderColor='var(--color-border)' }}
            />
            {confirm && confirm !== password && (
              <p style={{fontSize:'var(--text-xs)', color:'var(--color-error)', marginTop:'0.375rem'}}>Passwords don&apos;t match</p>
            )}
          </div>

          <button type="submit" disabled={loading}
            style={{width:'100%', background:'var(--color-primary)', color:'white', padding:'0.75rem', borderRadius:'var(--radius-lg)', fontSize:'var(--text-sm)', fontWeight:500, border:'none', cursor:loading?'not-allowed':'pointer', opacity:loading?0.65:1, transition:'opacity 180ms', marginTop:'0.25rem'}}>
            {loading
              ? <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:'spin 0.8s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  Creating account…
                </span>
              : 'Create account →'
            }
          </button>
        </form>

        <p style={{textAlign:'center', fontSize:'var(--text-sm)', color:'var(--color-text-muted)', marginTop:'1.5rem'}}>
          Already have an account?{' '}
          <Link href="/login" style={{color:'var(--color-primary)', fontWeight:500}}>Sign in</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
