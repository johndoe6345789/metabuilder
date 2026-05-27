'use client'

import { ThemeApplier } from '@/components/layout/ThemeApplier'
import { useLoginPage } from './hooks/useLoginPage'
import { LoginBrandPanel } from './LoginBrandPanel'
import { SignInForm } from './SignInForm'
import { RegisterForm } from './RegisterForm'
import styles from './login.module.scss'

export default function LoginPage() {
  const vm = useLoginPage()

  return (
    <div className={styles.page} data-testid="login-page">
      <ThemeApplier />
      <div
        className={styles.container}
        data-testid="login-container"
      >
        <LoginBrandPanel mode={vm.mode} />

        <div className={styles.form}>
          <div className={styles.formInner}>
            {vm.mode === 'signin' ? (
              <SignInForm
                username={vm.username}
                password={vm.password}
                showPass={vm.showPass}
                rememberMe={vm.rememberMe}
                displayError={vm.displayError}
                loading={vm.loading}
                forgot={vm.forgot}
                forgotUsername={vm.forgotUsername}
                forgotEmail={vm.forgotEmail}
                forgotLoading={vm.forgotLoading}
                onUsernameChange={vm.setUsername}
                onPasswordChange={vm.setPassword}
                onTogglePass={() => vm.setShowPass(p => !p)}
                onRememberChange={vm.setRememberMe}
                onSubmit={vm.handleSignIn}
                onForgotOpen={() => vm.setForgot('open')}
                onForgotClose={() => vm.setForgot('closed')}
                onForgotSubmit={vm.handleForgot}
                onForgotUsernameChange={vm.setForgotUsername}
                onForgotEmailChange={vm.setForgotEmail}
                onSwitchRegister={() => vm.switchMode('register')}
              />
            ) : (
              <RegisterForm
                username={vm.username}
                password={vm.password}
                confirm={vm.confirm}
                showPass={vm.showPass}
                showConf={vm.showConf}
                displayError={vm.displayError}
                loading={vm.loading}
                onUsernameChange={vm.setUsername}
                onPasswordChange={vm.setPassword}
                onConfirmChange={vm.setConfirm}
                onTogglePass={() => vm.setShowPass(p => !p)}
                onToggleConf={() => vm.setShowConf(p => !p)}
                onSubmit={vm.handleRegister}
                onSwitchSignIn={() => vm.switchMode('signin')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
