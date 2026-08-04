'use client'

import { useState } from 'react'
import Link from 'next/link'
import { beginLogin } from '@metabuilder/dbal-sso/core'
import { dbalSsoConfig } from '@/lib/dbalSsoConfig'
import {
  PRODUCT_TIERS,
  PRODUCT_PACKAGES,
} from '@/lib/packages/product-packages'
import s from './page.module.scss'

// basePath ('/app') is applied to Link/router but NOT to fetch(), so the
// API base must be prefixed explicitly to reach /app/api/* endpoints.
const BASE = typeof window !== 'undefined'
  ? (window.location.pathname.startsWith('/app') ? '/app' : '')
  : '/app'

type TierId = 'starter' | 'creator' | 'studio'

function slugify(val: string): string {
  return val
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 40)
}

export default function SignupPage() {
  const [community, setCommunity] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tier, setTier] = useState<TierId>('creator')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (community.trim().length < 2) {
      setError('Community name must be at least 2 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: slugify(community).length > 0
            ? slugify(community)
            : name.toLowerCase(),
          email,
          password,
          tenantName: slugify(community),
          plan: tier,
        }),
      })
      const json = await res.json() as { success: boolean; error?: string }
      if (!json.success) {
        setError(json.error ?? 'Registration failed. Please try again.')
        return
      }
      // The account now exists in DBAL; sign in through the normal OIDC
      // flow rather than fabricating a local session here.
      await beginLogin(dbalSsoConfig)
    } catch {
      setError('Could not connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.root}>
      <div className={s.card}>
        <Link href="/" className={s.logo} />
        <h1 className={s.title}>Create your community</h1>
        <p className={s.sub}>Free 14-day trial · No card needed</p>

        <form onSubmit={e => { void handleSubmit(e) }} className={s.form}>
          <label className={s.label}>
            Community name
            <input
              className={s.input}
              type="text"
              placeholder="Acme Running Club"
              value={community}
              onChange={e => { setCommunity(e.target.value) }}
              required
              autoFocus
            />
            {community.trim().length > 1 && (
              <span className={s.hint}>
                Your URL: metabuilder.app/
                <strong>{slugify(community)}</strong>
              </span>
            )}
          </label>

          <label className={s.label}>
            Your name
            <input
              className={s.input}
              type="text"
              placeholder="Alex Smith"
              value={name}
              onChange={e => { setName(e.target.value) }}
              required
            />
          </label>

          <label className={s.label}>
            Email
            <input
              className={s.input}
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value) }}
              required
            />
          </label>

          <label className={s.label}>
            Password
            <input
              className={s.input}
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => { setPassword(e.target.value) }}
              required
              minLength={8}
            />
          </label>

          <div className={s.tierSection}>
            <p className={s.tierLabel}>Choose your plan</p>
            <div className={s.tiers}>
              {PRODUCT_TIERS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`${s.tier} ${tier === t.id ? s.tierSelected : ''}`}
                  onClick={() => { setTier(t.id) }}
                >
                  {t.highlight && (
                    <span className={s.tierBadge}>Popular</span>
                  )}
                  <span className={s.tierName}>{t.name}</span>
                  <span className={s.tierPrice}>£{t.price}/mo</span>
                  <span className={s.tierPkgs}>
                    {t.packageIds.map(pid => {
                      const pkg = PRODUCT_PACKAGES.find(p => p.id === pid)
                      return pkg !== undefined
                        ? (
                          <span
                            key={pid}
                            className="material-symbols-rounded"
                            title={pkg.name}
                            style={{ color: pkg.color }}
                          >
                            {pkg.icon}
                          </span>
                        )
                        : null
                    })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error.length > 0 && (
            <p className={s.error}>{error}</p>
          )}

          <button
            type="submit"
            className={s.submit}
            disabled={
              loading ||
              community.trim().length === 0 ||
              name.trim().length === 0 ||
              email.trim().length === 0 ||
              password.length === 0
            }
          >
            {loading ? 'Creating your platform…' : 'Start free trial'}
          </button>
        </form>

        <p className={s.signin}>
          Already have an account?{' '}
          <Link href="/login" className={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
