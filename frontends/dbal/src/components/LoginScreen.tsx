'use client'

import styles from '../QueryConsole.module.scss'

interface LoginScreenProps {
  tokenInput: string
  onTokenChange: (v: string) => void
  onLogin: () => void
  onTurboLogin?: () => void
  turboError?: string | null
  onClearTurboError?: () => void
}

export function LoginScreen({
  tokenInput,
  onTokenChange,
  onLogin,
  onTurboLogin,
  turboError,
  onClearTurboError,
}: LoginScreenProps) {
  return (
    <div className={styles.root}>
      {turboError && onClearTurboError && (
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
              Turbologin Failed
            </h3>
            <p style={{ margin: '0 0 12px', color: '#aaa' }}>{turboError}</p>
            <p style={{ margin: '0 0 20px', color: '#aaa' }}>
              Copy a Turbologin from{' '}
              <a
                href="https://vault.wardcrew.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#7c6af7' }}
              >
                vault.wardcrew.com
              </a>
              , then try again.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClearTurboError}
                style={{
                  padding: '8px 16px', border: '1px solid #555',
                  borderRadius: '4px', background: 'none',
                  color: '#fff', cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.open('https://vault.wardcrew.com', '_blank')}
                style={{
                  padding: '8px 16px', border: '1px solid #555',
                  borderRadius: '4px', background: 'none',
                  color: '#fff', cursor: 'pointer',
                }}
              >
                Open Vault
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
            Enter your admin token to connect to the DBAL daemon.
          </p>
          <div className={styles.field}>
            <label className={styles.label}>Admin Token</label>
            <input
              className={styles.input}
              type="password"
              value={tokenInput}
              onChange={e => onTokenChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onLogin()}
              placeholder="Leave blank for default token"
              autoFocus
            />
          </div>
          <button
            className={styles.loginBtn}
            onClick={onLogin}
            type="button"
          >
            Connect
          </button>
          {onTurboLogin && (
            <button
              className={styles.loginBtn}
              onClick={onTurboLogin}
              type="button"
              data-testid="dbal-turbo-button"
              style={{
                marginTop: '8px',
                background: 'none',
                border: '1px solid currentColor',
                opacity: 0.85,
              }}
            >
              ⚡ Turbologin
            </button>
          )}
          <p className={styles.loginHint}>
            Default token is pre-configured for local development
          </p>
        </div>
      </div>
    </div>
  )
}
