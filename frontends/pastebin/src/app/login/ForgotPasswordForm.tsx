import { FormEvent } from 'react'
import type { ForgotState } from './hooks/useLoginPage'
import styles from './login.module.scss'

interface ForgotPasswordFormProps {
  forgot: ForgotState
  forgotUsername: string
  forgotEmail: string
  forgotLoading: boolean
  onForgotUsernameChange: (v: string) => void
  onForgotEmailChange: (v: string) => void
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
}

export function ForgotPasswordForm({
  forgot,
  forgotUsername,
  forgotEmail,
  forgotLoading,
  onForgotUsernameChange,
  onForgotEmailChange,
  onSubmit,
  onCancel,
}: ForgotPasswordFormProps) {
  if (forgot === 'sent') {
    return (
      <p className={styles.success} data-testid="forgot-success" role="status">
        Reset link sent — check your inbox.
      </p>
    )
  }

  if (forgot === 'open') {
    return (
      <form
        className={styles.forgotBox}
        onSubmit={onSubmit}
        data-testid="forgot-password-form"
        aria-label="Forgot password"
      >
        <p className={styles.forgotHint}>
          Enter your username and the email to send the reset link to.
        </p>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="fgt-u">
            Username
          </label>
          <input
            id="fgt-u"
            className={styles.input}
            type="text"
            data-testid="forgot-username"
            aria-required="true"
            value={forgotUsername}
            onChange={e => onForgotUsernameChange(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="fgt-e">
            Email address
          </label>
          <input
            id="fgt-e"
            className={styles.input}
            type="email"
            data-testid="forgot-email"
            aria-required="true"
            value={forgotEmail}
            onChange={e => onForgotEmailChange(e.target.value)}
            required
          />
        </div>
        <div className={styles.forgotActions}>
          <button
            type="button"
            className={styles.textBtn}
            data-testid="forgot-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.btnSm}
            data-testid="forgot-submit"
            disabled={forgotLoading}
          >
            {forgotLoading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </div>
      </form>
    )
  }

  return null
}
