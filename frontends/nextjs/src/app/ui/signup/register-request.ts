'use client'

import { beginLogin } from '@metabuilder/dbal-sso/core'
import { dbalSsoConfig } from '@/lib/dbalSsoConfig'
import { buildRegisterPayload, type SignupFields } from './signup-form'

// basePath ('/app') is applied to Link/router but NOT to fetch(), so the
// API base must be prefixed explicitly to reach /app/api/* endpoints.
export function apiBase(): string {
  if (typeof window === 'undefined') return '/app'
  return window.location.pathname.startsWith('/app') ? '/app' : ''
}

interface RegisterResponse {
  success: boolean
  error?: string
}

/**
 * Registers the account and, on success, starts the OIDC login.
 *
 * Returns an error message on failure, or null on success -- the account
 * now exists in DBAL, so the caller signs in through the normal flow
 * rather than this function fabricating a local session.
 */
export async function submitSignup(
  fields: SignupFields
): Promise<string | null> {
  try {
    const res = await fetch(`${apiBase()}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(buildRegisterPayload(fields)),
    })
    const json = (await res.json()) as RegisterResponse
    if (!json.success) {
      return json.error ?? 'Registration failed. Please try again.'
    }
    await beginLogin(dbalSsoConfig)
    return null
  } catch {
    return 'Could not connect. Please try again.'
  }
}
