import type { FormEvent } from 'react'
import type { ForgotState } from './hooks/useLoginPage'

export interface SignInFormProps {
  username: string
  password: string
  showPass: boolean
  rememberMe: boolean
  displayError: string | null
  loading: boolean
  forgot: ForgotState
  forgotUsername: string
  forgotEmail: string
  forgotLoading: boolean
  onUsernameChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onTogglePass: () => void
  onRememberChange: (v: boolean) => void
  onSubmit: (e: FormEvent) => void
  onForgotOpen: () => void
  onForgotClose: () => void
  onForgotSubmit: (e: FormEvent) => void
  onForgotUsernameChange: (v: string) => void
  onForgotEmailChange: (v: string) => void
  onSwitchRegister: () => void
}

export interface RegisterFormProps {
  username: string
  password: string
  confirm: string
  showPass: boolean
  showConf: boolean
  displayError: string | null
  loading: boolean
  onUsernameChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onConfirmChange: (v: string) => void
  onTogglePass: () => void
  onToggleConf: () => void
  onSubmit: (e: FormEvent) => void
  onSwitchSignIn: () => void
}
