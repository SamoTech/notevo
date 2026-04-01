'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: 'var(--color-bg)'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="#01696f"/>
              <path d="M7 8h14M7 13h10M7 18h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="21" cy="18" r="4" fill="#0f3638" stroke="white" strokeWidth="1.5"/>
              <path d="M21 16.5v1.5l1 1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="text-2xl font-serif">Notevo</span>
          </Link>
          <h1 className="text-2xl font-serif font-light text-gray-900">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'signin' ? 'Sign in to access your notes' : 'Start writing private notes'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          </div>

          {message && (
            <p className={`text-sm p-3 rounded-lg ${
              message.includes('Check') ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'
            }`}>{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
