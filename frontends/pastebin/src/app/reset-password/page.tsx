'use client'
import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import { ThemeApplier } from '@/components/layout/ThemeApplier'
import styles from '../login/login.module.scss'

function apiBase() {
  return (process.env.NEXT_PUBLIC_FLASK_BACKEND_URL ?? '').replace(/\/$/, '') || '/pastebin-api'
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (!token) { setError('Invalid reset link'); return }

    setLoading(true)
    try {
      const res = await fetch(`${apiBase()}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Reset failed'); return }
      setDone(true)
      setTimeout(() => router.replace('/login'), 2000)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <ThemeApplier />
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <MaterialIcon name="lock_reset" className={styles.logo} />
          <h1>Reset password</h1>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {done ? (
          <p className={styles.forgotSent}>Password updated! Redirecting to sign in…</p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input className={styles.input} type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus autoComplete="new-password" />
            <input className={styles.input} type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
            <button className={styles.submit} type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Set new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
