'use client'
import { Suspense } from 'react'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import { ThemeApplier } from '@/components/layout/ThemeApplier'
import { useResetPasswordForm } from './hooks/useResetPasswordForm'
import styles from '../login/login.module.scss'

function ResetPasswordForm() {
  const {
    password, confirm, loading, error, done,
    setPassword, setConfirm, handleSubmit,
  } = useResetPasswordForm()

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
          <p className={styles.forgotSent}>
            Password updated! Redirecting to sign in…
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="new-password"
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              className={styles.submit}
              type="submit"
              disabled={loading}
            >
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
    <Suspense
      fallback={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}>
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
