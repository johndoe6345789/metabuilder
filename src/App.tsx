import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { Login } from '@/components/Login'
import { Builder } from '@/components/Builder'
import type { Session } from '@/lib/builder-types'
import { toast } from 'sonner'

const DEFAULT_USERNAME = 'admin'
const DEFAULT_PASSWORD = 'admin'

function App() {
  const [session, setSession] = useKV<Session>('builder_session', {
    authenticated: false,
    username: '',
    timestamp: 0,
  })

  if (!session) return null

  const handleLogin = (username: string, password: string) => {
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      setSession({
        authenticated: true,
        username,
        timestamp: Date.now(),
      })
      toast.success('Welcome to GUI Builder!')
    } else {
      toast.error('Invalid credentials. Use admin/admin')
    }
  }

  const handleLogout = () => {
    setSession({
      authenticated: false,
      username: '',
      timestamp: 0,
    })
    toast.info('Logged out successfully')
  }

  if (!session.authenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    )
  }

  return (
    <>
      <Builder onLogout={handleLogout} />
      <Toaster />
    </>
  )
}

export default App
