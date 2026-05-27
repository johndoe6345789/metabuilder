import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginUser, registerUser, clearError } from '@/store/slices/authSlice'
import {
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '@/store/selectors'

export type Mode = 'signin' | 'register'
export type ForgotState = 'closed' | 'open' | 'sent'

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL ?? ''
  ).replace(/\/$/, '') || '/pastebin-api'
}

export function useLoginPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const loading = useAppSelector(selectAuthLoading)
  const reduxError = useAppSelector(selectAuthError)

  const [mode, setMode] = useState<Mode>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [localError, setLocalError] = useState('')

  const [forgot, setForgot] = useState<ForgotState>('closed')
  const [forgotUsername, setForgotUsername] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) router.replace('/')
  }, [isAuthenticated, router])

  const switchMode = (m: Mode) => {
    setMode(m)
    setLocalError('')
    setShowPass(false)
    setShowConf(false)
    setForgot('closed')
    dispatch(clearError())
  }

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError('')
    const result = await dispatch(loginUser({ username, password }))
    if (loginUser.fulfilled.match(result)) router.replace('/')
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError('')
    if (password !== confirm) {
      setLocalError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }
    const result = await dispatch(registerUser({ username, password }))
    if (registerUser.fulfilled.match(result)) router.replace('/')
  }

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    try {
      await fetch(`${apiBase()}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotUsername,
          email: forgotEmail,
        }),
      })
    } finally {
      setForgotLoading(false)
      setForgot('sent')
    }
  }

  const displayError = localError || reduxError

  return {
    mode,
    username,
    password,
    confirm,
    showPass,
    showConf,
    rememberMe,
    displayError,
    forgot,
    forgotUsername,
    forgotEmail,
    forgotLoading,
    loading,
    setUsername,
    setPassword,
    setConfirm,
    setShowPass,
    setShowConf,
    setRememberMe,
    setForgot,
    setForgotUsername,
    setForgotEmail,
    switchMode,
    handleSignIn,
    handleRegister,
    handleForgot,
  }
}
