'use client'

import styles from '../QueryConsole.module.scss'

interface LoginScreenProps {
  tokenInput: string
  onTokenChange: (v: string) => void
  onLogin: () => void
}

export function LoginScreen({
  tokenInput,
  onTokenChange,
  onLogin,
}: LoginScreenProps) {
  return (
    <div className={styles.root}>
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
          <p className={styles.loginHint}>
            Default token is pre-configured for local development
          </p>
        </div>
      </div>
    </div>
  )
}
