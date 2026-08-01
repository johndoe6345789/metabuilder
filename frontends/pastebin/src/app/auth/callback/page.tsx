'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch } from '@/store/hooks'
import { completeOidcLogin } from '@/store/slices/authSlice'
import styles from '../../login/login.module.scss'

export default function AuthCallbackPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const ranOnce = useRef(false)

  useEffect(() => {
    // Effects run twice under StrictMode in dev — the authorization code is
    // single-use, so a second exchange attempt would otherwise always fail.
    if (ranOnce.current) return
    ranOnce.current = true

    const oidcError = searchParams.get('error')
    if (oidcError) {
      setError(searchParams.get('error_description') ?? oidcError)
      return
    }

    const code = searchParams.get('code')
    const state = searchParams.get('state')
    if (!code || !state) {
      setError('Missing authorization code — start over from the login page')
      return
    }

    dispatch(completeOidcLogin({ code, state })).then(result => {
      if (completeOidcLogin.fulfilled.match(result)) {
        router.replace('/')
      } else {
        setError((result.payload as string) ?? 'Sign-in failed')
      }
    })
  }, [dispatch, router, searchParams])

  return (
    <div className={styles.page} data-testid="auth-callback-page">
      <div className={styles.container}>
        <div className={styles.form}>
          <div className={styles.formInner}>
            {error ? (
              <>
                <h1 className={styles.formTitle}>Sign-in failed</h1>
                <div className={styles.error} role="alert">{error}</div>
                <button className={styles.btn} onClick={() => router.replace('/login')}>
                  Back to login
                </button>
              </>
            ) : (
              <p>Signing you in…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
