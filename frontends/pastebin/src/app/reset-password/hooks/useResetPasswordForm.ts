import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function apiBase() {
  return (
    (process.env.NEXT_PUBLIC_FLASK_BACKEND_URL ?? '').replace(/\/$/, '') ||
    '/pastebin-api'
  )
}

export interface ResetPasswordFormState {
  password: string
  confirm: string
  loading: boolean
  error: string
  done: boolean
  token: string
  setPassword: (v: string) => void
  setConfirm: (v: string) => void
  handleSubmit: (e: FormEvent) => Promise<void>
}

export function useResetPasswordForm(): ResetPasswordFormState {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!token) {
      setError('Invalid reset link')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${apiBase()}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Reset failed')
        return
      }
      setDone(true)
      setTimeout(() => router.replace('/login'), 2000)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return {
    password,
    confirm,
    loading,
    error,
    done,
    token,
    setPassword,
    setConfirm,
    handleSubmit,
  }
}
