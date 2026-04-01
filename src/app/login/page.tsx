'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: 'var(--color-bg)'}}>
      <div style={{width: '100%', maxWidth: 400, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem'}}>
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" style={{color: 'var(--color-primary)'}}>
            <rect x="4" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M9 10h10M9 14h10M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)'}}>Notevo</span>
        </div>
        <h1 style={{fontSize: 'var(--text-lg)', fontWeight: 600, textAlign: 'center', marginBottom: '0.5rem'}}>Welcome back</h1>
        <p style={{fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '2rem'}}>Sign in to your notes</p>

        {error && <div style={{background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 'var(--text-sm)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem'}}>{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label style={{display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.5rem'}}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', fontSize: 'var(--text-sm)', outline: 'none'}}
              className="focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label style={{display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.5rem'}}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', fontSize: 'var(--text-sm)', outline: 'none'}}
              className="focus:ring-2 focus:ring-teal-500" />
          </div>
          <button type="submit" disabled={loading}
            style={{width: '100%', background: 'var(--color-primary)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 500, opacity: loading ? 0.6 : 1}}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p style={{textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '1.5rem'}}>
          No account? <Link href="/signup" style={{color: 'var(--color-primary)', fontWeight: 500}}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
