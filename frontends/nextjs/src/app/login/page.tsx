'use client'

import { useState } from 'react'
import Link from 'next/link'
import { beginLogin, friendlySignInError } from '@metabuilder/dbal-sso/core'
import { dbalSsoConfig } from '@/lib/dbalSsoConfig'
import s from './page.module.scss'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = () => {
    setError('')
    setLoading(true)
    beginLogin(dbalSsoConfig).catch(e => {
      setError(friendlySignInError(e))
      setLoading(false)
    })
  }

  return (
    <div className={s.root}>
      <div className={s.card}>
        <div className={s.logo} />
        <h1 className={s.title}>Sign in to MetaBuilder</h1>
        <p className={s.subtitle}>Continue with your MetaBuilder account</p>

        {error.length > 0 && <p className={s.error}>{error}</p>}

        <button
          className={s.submit}
          type="button"
          disabled={loading}
          onClick={handleSignIn}
        >
          {loading ? 'Redirecting…' : 'Sign In'}
        </button>

        <p className={s.signin}>
          New here?{' '}
          <Link className={s.link} href="/ui/signup">
            Create your community
          </Link>
        </p>

        <Link className={s.back} href="/">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
