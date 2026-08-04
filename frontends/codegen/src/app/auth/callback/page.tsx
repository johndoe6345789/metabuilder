'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch } from '@/store'
import { completeOidcLogin } from '@/store/slices/authSlice'

function AuthCallbackContent() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const ranOnce = useRef(false)

  useEffect(() => {
    // Effects run twice under StrictMode in dev -- the authorization code
    // is single-use, so a second exchange attempt would otherwise fail.
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
      setError('Missing authorization code -- start over from the login page')
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
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', color: '#fff', background: '#0f0f1a',
    }}>
      {error ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#f87171', marginBottom: '12px' }}>{error}</p>
          <a href="/codegen/login" style={{ color: '#8b5cf6' }}>Back to login</a>
        </div>
      ) : (
        <p>Signing you in…</p>
      )}
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  )
}
