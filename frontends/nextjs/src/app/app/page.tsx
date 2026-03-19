/**
 * App Root Page
 *
 * Entry point for /app - redirects to dashboard if authenticated,
 * or shows a sign-in prompt.
 */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { Typography, Paper, Button } from '@/fakemui'

export default function AppRootPage() {
  const auth = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      router.replace('/app/dashboard')
    }
  }, [auth.isAuthenticated, auth.isLoading, router])

  if (auth.isLoading) {
    return null
  }

  if (auth.isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 480 }}>
        <Typography variant="h4" gutterBottom>
          MetaBuilder
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to access the application builder, admin tools, and your dashboard.
        </Typography>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button variant="contained" onClick={() => { router.push('/app/ui/login') }}>
            Sign In
          </Button>
          <Button variant="outlined" onClick={() => { router.push('/') }}>
            Back to Home
          </Button>
        </div>
      </Paper>
    </div>
  )
}
