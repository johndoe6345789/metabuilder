'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { completeLogin, friendlySignInError } from '@metabuilder/dbal-sso/core'
import { dbalSsoConfig } from '@/lib/dbalSsoConfig'
import { authStore } from '@/hooks/auth/auth-store'
import { tenantPanelPath } from '@/lib/tenant/workspace-paths'
import s from '../../login/page.module.scss'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    // Every setError call below runs from inside a .then()/.catch()
    // callback, never synchronously during the effect itself -- including
    // the missing-params case, folded into the same chain via a thrown
    // sentinel rather than an early synchronous setState call.
    Promise.resolve()
      .then(() => {
        if (code === null || state === null) {
          throw new Error('missing-params')
        }
        return completeLogin(dbalSsoConfig, code, state)
      })
      .then(tokens => authStore.applySession(tokens.token, tokens.refreshToken))
      .then(() => {
        const tenantId = authStore.getState().user?.tenantId
        router.replace(tenantPanelPath(tenantId))
      })
      .catch((e: unknown) => {
        setError(
          e instanceof Error && e.message === 'missing-params'
            ? 'Your sign-in link looks incomplete or was already used — please try signing in again.'
            : friendlySignInError(e)
        )
      })
  }, [searchParams, router])

  return (
    <div className={s.root}>
      <div className={s.card}>
        <div className={s.logo} />
        {error !== null ? (
          <>
            <p className={s.error}>{error}</p>
            <Link className={s.back} href="/login">
              Back to sign in
            </Link>
          </>
        ) : (
          <p className={s.subtitle}>Signing in…</p>
        )}
      </div>
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
