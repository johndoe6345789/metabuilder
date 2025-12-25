import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Warning, Eye, EyeSlash } from '@phosphor-icons/react'

interface PasswordChangeDialogProps {
  open: boolean
  username: string
  onPasswordChanged: (newPassword: string) => void
  isFirstLogin?: boolean
}

export function PasswordChangeDialog({ open, username, onPasswordChanged, isFirstLogin = false }: PasswordChangeDialogProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = () => {
    setError('')

    if (!newPassword) {
      setError('Password is required')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    onPasswordChanged(newPassword)
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isFirstLogin && <Warning className="text-orange-500" size={24} />}
            {isFirstLogin ? 'Change Your Password' : 'Update Password'}
          </DialogTitle>
          <DialogDescription>
            {isFirstLogin
              ? 'For security reasons, you must change your password on first login.'
              : `Change password for user: ${username}`}
          </DialogDescription>
        </DialogHeader>

        {isFirstLogin && (
          <Alert className="bg-orange-500/10 border-orange-500/50">
            <Warning className="h-4 w-4 text-orange-500" />
            <AlertDescription className="ml-2 text-sm">
              Your account is using default credentials. Please choose a strong, unique password.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit()
                }
              }}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full">
            {isFirstLogin ? 'Set New Password' : 'Update Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
