import type { SignInFormProps } from './login.types'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { PasswordField } from './PasswordField'
import styles from './login.module.scss'

export function SignInForm({
  username,
  password,
  showPass,
  rememberMe,
  displayError,
  loading,
  forgot,
  forgotUsername,
  forgotEmail,
  forgotLoading,
  onUsernameChange,
  onPasswordChange,
  onTogglePass,
  onRememberChange,
  onSubmit,
  onTurboLogin,
  onForgotOpen,
  onForgotClose,
  onForgotSubmit,
  onForgotUsernameChange,
  onForgotEmailChange,
  onSwitchRegister,
}: SignInFormProps) {
  return (
    <>
      <div>
        <h1 className={styles.formTitle}>Log In</h1>
        <p className={styles.formSub}>Enter your credentials to continue.</p>
      </div>

      {displayError && (
        <div className={styles.error} data-testid="login-error" role="alert">
          {displayError}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        style={{ display: 'contents' }}
        data-testid="login-form"
        aria-label="Sign in"
      >
        <div className={styles.field}>
          <label className={styles.label} htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className={styles.input}
            type="text"
            data-testid="login-username"
            aria-required="true"
            value={username}
            onChange={e => onUsernameChange(e.target.value)}
            required
            autoFocus
            autoComplete="username"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <PasswordField
            id="password"
            value={password}
            showPass={showPass}
            testId="login-password"
            toggleTestId="login-toggle-password"
            autoComplete="current-password"
            onChange={onPasswordChange}
            onToggle={onTogglePass}
          />
        </div>

        <div className={styles.checkRow}>
          <input
            id="remember"
            type="checkbox"
            className={styles.checkbox}
            data-testid="login-remember"
            checked={rememberMe}
            onChange={e => onRememberChange(e.target.checked)}
          />
          <label htmlFor="remember" className={styles.checkLabel}>
            Keep me signed in
          </label>
        </div>

        <button
          className={styles.btn}
          type="submit"
          data-testid="login-submit"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Log In'}
        </button>

        <button
          type="button"
          className={styles.textBtn}
          data-testid="login-turbo"
          onClick={onTurboLogin}
        >
          ⚡ Turbologin
        </button>
      </form>

      {forgot === 'closed' && (
        <button
          type="button"
          className={styles.textBtn}
          data-testid="login-forgot-password"
          onClick={onForgotOpen}
        >
          Forgot your password?
        </button>
      )}

      <ForgotPasswordForm
        forgot={forgot}
        forgotUsername={forgotUsername}
        forgotEmail={forgotEmail}
        forgotLoading={forgotLoading}
        onForgotUsernameChange={onForgotUsernameChange}
        onForgotEmailChange={onForgotEmailChange}
        onSubmit={onForgotSubmit}
        onCancel={onForgotClose}
      />

      <div className={styles.divider} />
      <div className={styles.switchRow}>
        Don&apos;t have an account?{' '}
        <button
          type="button"
          data-testid="login-switch-register"
          onClick={onSwitchRegister}
        >
          Create one.
        </button>
      </div>
    </>
  )
}
