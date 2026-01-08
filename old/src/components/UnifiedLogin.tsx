import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignIn, UserPlus, ArrowLeft, Envelope } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Database, hashPassword } from '@/lib/database'
import { generateScrambledPassword, simulateEmailSend } from '@/lib/password-utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UnifiedLoginProps {
  onLogin: (credentials: { username: string; password: string }) => void
  onRegister: (username: string, email: string, password: string) => void
  onBack?: () => void
}

export function UnifiedLogin({ onLogin, onRegister, onBack }: UnifiedLoginProps) {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '' })
  const [resetEmail, setResetEmail] = useState('')

  const handleLogin = () => {
    if (!loginForm.username || !loginForm.password) {
      toast.error('Please fill in all fields')
      return
    }

    onLogin(loginForm)
  }

  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.email) {
      toast.error('Please fill in all fields')
      return
    }

    const scrambledPassword = generateScrambledPassword(16)
    
    const smtpConfig = await Database.getSMTPConfig()
    await simulateEmailSend(
      registerForm.email,
      'Your MetaBuilder Account Password',
      `Welcome to MetaBuilder!\n\nYour account has been created.\nUsername: ${registerForm.username}\nTemporary Password: ${scrambledPassword}\n\nPlease login and change your password from your profile settings.`,
      smtpConfig || undefined
    )
    
    toast.success('Account created! Check console for your password (simulated email)')
    onRegister(registerForm.username, registerForm.email, scrambledPassword)
  }

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email address')
      return
    }

    const users = await Database.getUsers()
    const user = users.find(u => u.email === resetEmail)
    
    if (!user) {
      toast.error('No account found with that email address')
      return
    }

    const newPassword = generateScrambledPassword(16)
    const passwordHash = await hashPassword(newPassword)
    await Database.setCredential(user.username, passwordHash)
    
    const smtpConfig = await Database.getSMTPConfig()
    await simulateEmailSend(
      resetEmail,
      'MetaBuilder Password Reset',
      `Your password has been reset.\n\nUsername: ${user.username}\nNew Password: ${newPassword}\n\nPlease login and change your password from your profile settings.`,
      smtpConfig || undefined
    )
    
    toast.success('Password reset! Check console for your new password (simulated email)')
    setResetEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2" size={16} />
          Back to Home
        </Button>
      )}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-white" />
          </div>
          <CardTitle className="text-2xl">MetaBuilder</CardTitle>
          <CardDescription>Sign in to access the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">
                <SignIn className="mr-2" size={16} />
                Login
              </TabsTrigger>
              <TabsTrigger value="register">
                <UserPlus className="mr-2" size={16} />
                Register
              </TabsTrigger>
              <TabsTrigger value="reset">
                <Envelope className="mr-2" size={16} />
                Reset
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Enter username"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter password"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button className="w-full" onClick={handleLogin}>
                <SignIn className="mr-2" size={16} />
                Sign In
              </Button>
              <Alert>
                <AlertDescription className="text-xs">
                  <p className="font-semibold mb-1">Test Credentials:</p>
                  <p>Check browser console for default user passwords (they are scrambled on first run)</p>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-6">
              <Alert>
                <AlertDescription className="text-sm">
                  No password required! A secure random password will be emailed to you after registration.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  placeholder="Choose a username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="your@email.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                />
              </div>
              <Button className="w-full" onClick={handleRegister}>
                <UserPlus className="mr-2" size={16} />
                Create Account
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Your password will be sent to your email address
              </p>
            </TabsContent>

            <TabsContent value="reset" className="space-y-4 mt-6">
              <Alert>
                <AlertDescription className="text-sm">
                  Enter your email address to receive a new password. Contact administrator if you need help.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordReset()}
                />
              </div>
              <Button className="w-full" onClick={handlePasswordReset}>
                <Envelope className="mr-2" size={16} />
                Reset Password
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Need help? Contact your system administrator
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
