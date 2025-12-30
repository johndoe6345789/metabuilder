import { SignIn } from '@/fakemui/icons'

import { Alert, AlertDescription, Button, Input, Label } from '@/components/ui'

export interface LoginFormProps {
  username: string
  password: string
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
}

export function LoginForm({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-username">Username</Label>
        <Input
          id="login-username"
          value={username}
          onChange={e => onUsernameChange(e.target.value)}
          placeholder="Enter username"
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={e => onPasswordChange(e.target.value)}
          placeholder="Enter password"
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
        />
      </div>
      <Button className="w-full" onClick={onSubmit}>
        <SignIn className="mr-2" size={16} />
        Sign In
      </Button>
      <Alert>
        <AlertDescription className="text-xs">
          <p className="font-semibold mb-1">Test Credentials:</p>
          <p>Check browser console for default user passwords (they are scrambled on first run)</p>
        </AlertDescription>
      </Alert>
    </div>
  )
}
