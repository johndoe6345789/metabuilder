'use client'

import styles from '../QueryConsole.module.scss'

interface LoginScreenProps {
  onLogin: () => void
  error?: string | null
  onClearError?: () => void
}

export function LoginScreen({ onLogin, error, onClearError }: LoginScreenProps) {
  return (
    <div className={styles.root}>
      {error && onClearError && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: '#1a1a2e', border: '1px solid #333',
            borderRadius: '8px', padding: '24px',
            maxWidth: '380px', width: '90%', color: '#fff',
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>
              Sign-in Failed
            </h3>
            <p style={{ margin: '0 0 20px', color: '#aaa' }}>{error}</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClearError}
                style={{
                  padding: '8px 16px', border: '1px solid #555',
                  borderRadius: '4px', background: 'none',
                  color: '#fff', cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginIcon}>DB</div>
          <h2 className={styles.loginTitle}>DBAL Query Console</h2>
          <p className={styles.loginSub}>
            Sign in with your DBAL account. Admin-level access (admin, god,
            or supergod role) is required to run queries here.
          </p>
          <button
            className={styles.loginBtn}
            onClick={onLogin}
            type="button"
            data-testid="dbal-sso-login-button"
          >
            Sign in with DBAL SSO
          </button>
        </div>
      </div>
    </div>
  )
}
