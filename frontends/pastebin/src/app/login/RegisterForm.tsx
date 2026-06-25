import type { RegisterFormProps } from './login.types'
import { PasswordField } from './PasswordField'
import styles from './login.module.scss'

export function RegisterForm({
  username,
  password,
  confirm,
  showPass,
  showConf,
  displayError,
  loading,
  onUsernameChange,
  onPasswordChange,
  onConfirmChange,
  onTogglePass,
  onToggleConf,
  onSubmit,
  onSwitchSignIn,
}: RegisterFormProps) {
  return (
    <>
      <div>
        <h1 className={styles.formTitle}>Create Account</h1>
        <p className={styles.formSub}>
          Choose a username and password to get started.
        </p>
      </div>

      {displayError && (
        <div className={styles.error} data-testid="register-error" role="alert">
          {displayError}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        style={{ display: 'contents' }}
        data-testid="register-form"
        aria-label="Create account"
      >
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-u">
            Username
          </label>
          <input
            id="reg-u"
            className={styles.input}
            type="text"
            data-testid="register-username"
            aria-required="true"
            value={username}
            onChange={e => onUsernameChange(e.target.value)}
            required
            autoFocus
            autoComplete="username"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-p">
            Password
          </label>
          <PasswordField
            id="reg-p"
            value={password}
            showPass={showPass}
            testId="register-password"
            toggleTestId="register-toggle-password"
            autoComplete="new-password"
            onChange={onPasswordChange}
            onToggle={onTogglePass}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-c">
            Confirm Password
          </label>
          <PasswordField
            id="reg-c"
            value={confirm}
            showPass={showConf}
            testId="register-confirm-password"
            toggleTestId="register-toggle-confirm"
            autoComplete="new-password"
            onChange={onConfirmChange}
            onToggle={onToggleConf}
          />
        </div>

        <button
          className={styles.btn}
          type="submit"
          data-testid="register-submit"
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <div className={styles.divider} />
      <div className={styles.switchRow}>
        Already have an account?{' '}
        <button
          type="button"
          data-testid="register-switch-login"
          onClick={onSwitchSignIn}
        >
          Log In.
        </button>
      </div>
    </>
  )
}
