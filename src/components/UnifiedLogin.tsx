import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignIn, UserPlus, ArrowLeft } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface UnifiedLoginProps {
  onLogin: (credentials: { username: string; password: string }) => void
  onRegister: (username: string, email: string, password: string) => void
  onBack?: () => void
}

export function UnifiedLogin({ onLogin, onRegister, onBack }: UnifiedLoginProps) {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })

  const handleLogin = () => {
    if (!loginForm.username || !loginForm.password) {
      toast.error('Please fill in all fields')
      return
    }

    onLogin(loginForm)
  }

  const handleRegister = () => {
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      toast.error('Please fill in all fields')
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    onRegister(registerForm.username, registerForm.email, registerForm.password)
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">
                <SignIn className="mr-2" size={16} />
                Login
              </TabsTrigger>
              <TabsTrigger value="register">
                <UserPlus className="mr-2" size={16} />
                Register
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
              <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded-lg">
                <p className="font-semibold">Test Credentials:</p>
                <p>• God: <code className="font-mono">god / god123</code></p>
                <p>• Admin: <code className="font-mono">admin / admin</code></p>
                <p>• User: <code className="font-mono">demo / demo</code></p>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-6">
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="Choose a password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-confirm">Confirm Password</Label>
                <Input
                  id="register-confirm"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                />
              </div>
              <Button className="w-full" onClick={handleRegister}>
                <UserPlus className="mr-2" size={16} />
                Create Account
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
