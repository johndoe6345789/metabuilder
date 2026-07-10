'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import s from './page.module.scss'

const BASE = typeof window !== 'undefined'
  ? (window.location.pathname.startsWith('/app') ? '/app' : '')
  : '/app'

async function doLogin(
  identifier: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, password }),
  })
  return res.json() as Promise<{ success: boolean; error?: string }>
}

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const json = await doLogin(username, password)
      if (!json.success) {
        setError(json.error ?? 'Invalid username or password.')
        return
      }
      router.replace('/app/dashboard')
    } catch {
      setError('Could not connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTurboLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const text = await navigator.clipboard.readText()
      const payload = JSON.parse(text) as { user?: string; pass?: string }
      if (!payload.user || !payload.pass) {
        setError('Clipboard does not contain a valid Turbo Login payload.')
        return
      }
      setUsername(payload.user)
      setPassword(payload.pass)
      const json = await doLogin(payload.user, payload.pass)
      if (!json.success) {
        setError(json.error ?? 'Invalid username or password.')
        return
      }
      router.replace('/app/dashboard')
    } catch {
      setError('No valid Turbo Login payload in clipboard.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.root}>
      <div className={s.card}>
        <div className={s.logo} />
        <h1 className={s.title}>Sign in to MetaBuilder</h1>
        <p className={s.subtitle}>Enter your credentials to continue</p>

        <form className={s.form} onSubmit={(event) => { void handleSubmit(event) }}>
          <div className={s.field}>
            <label className={s.label} htmlFor="username">Username</label>
            <input
              id="username"
              className={s.input}
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => { setUsername(e.target.value) }}
              placeholder="Enter username"
              required
            />
          </div>

          <div className={s.field}>
            <label className={s.label} htmlFor="password">Password</label>
            <input
              id="password"
              className={s.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value) }}
              placeholder="Enter password"
              required
            />
          </div>

          {error.length > 0 && <p className={s.error}>{error}</p>}

          <button className={s.submit} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className={s.divider}><span>or</span></div>

        <button className={s.turbo} type="button" disabled={loading}
          onClick={() => { void handleTurboLogin() }}>
          ⚡ Turbo Login
        </button>

        <Link className={s.back} href="/">← Back to home</Link>
      </div>
    </div>
  )
}
