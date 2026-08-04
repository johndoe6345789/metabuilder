'use client'

import { useCallback, useState } from 'react'
import { beginLogin } from '@metabuilder/dbal-sso/core'
import { dbalSsoConfig } from '@/lib/dbalSsoConfig'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  const handleLogin = useCallback(() => {
    setError(null)
    beginLogin(dbalSsoConfig).catch(e => {
      setError(e instanceof Error ? e.message : 'Sign-in failed to start')
    })
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', color: '#fff', background: '#0f0f1a',
    }}>
      <div style={{
        textAlign: 'center', padding: '32px', maxWidth: '360px',
      }}>
        <h1 style={{ fontSize: '20px', marginBottom: '8px' }}>CodeForge IDE</h1>
        <p style={{ color: '#aaa', marginBottom: '24px' }}>
          Sign in with your DBAL account to save and load projects.
        </p>
        {error && (
          <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>
        )}
        <button
          type="button"
          onClick={handleLogin}
          data-testid="codegen-sso-login-button"
          style={{
            padding: '10px 20px', borderRadius: '6px', border: 'none',
            background: '#8b5cf6', color: '#fff', cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Sign in with DBAL SSO
        </button>
      </div>
    </div>
  )
}
