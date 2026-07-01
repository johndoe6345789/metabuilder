'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import s from './page.module.scss'

const BASE = typeof window !== 'undefined'
  ? (window.location.pathname.startsWith('/app') ? '/app' : '')
  : '/app'

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
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier: username, password }),
      })
      const json = await res.json() as { success?: boolean; error?: string }
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

  return (
    <div className={s.root}>
      <div className={s.card}>
        <div className={s.logo} />
        <h1 className={s.title}>Sign in to MetaBuilder</h1>
        <p className={s.subtitle}>Enter your credentials to continue</p>

        <form className={s.form} onSubmit={handleSubmit}>
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

        <a className={s.back} href="/">← Back to home</a>
      </div>
    </div>
  )
}
