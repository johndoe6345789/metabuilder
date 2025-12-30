import { Check, Copy, Eye, EyeSlash, Warning } from '@/fakemui/icons'

import { Alert, AlertDescription } from '@/components/ui'
import { Button } from '@/components/ui'

interface GodCredentialsBannerProps {
  username: string
  password: string
  showPassword: boolean
  onTogglePassword: () => void
  copied: boolean
  onCopy: () => void
  timeRemaining: string
  variant: 'god' | 'supergod'
}

export function GodCredentialsBanner({
  username,
  password,
  showPassword,
  onTogglePassword,
  copied,
  onCopy,
  timeRemaining,
  variant,
}: GodCredentialsBannerProps) {
  const isSupergod = variant === 'supergod'

  return (
    <Alert
      className={
        isSupergod
          ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/50'
          : 'bg-gradient-to-br from-purple-500/10 to-orange-500/10 border-2 border-purple-500/50'
      }
    >
      <Warning className={`h-5 w-5 ${isSupergod ? 'text-amber-500' : 'text-orange-500'}`} />
      <AlertDescription className="ml-2">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <p className="font-semibold text-base text-foreground">
                {isSupergod
                  ? 'Super God Credentials (Level 5)'
                  : 'God-Tier Admin Credentials (Level 4)'}
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Username:</span>
                  <code className="px-2 py-0.5 bg-background/50 rounded font-mono font-semibold">
                    {username}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Password:</span>
                  <code className="px-2 py-0.5 bg-background/50 rounded font-mono font-semibold text-xs break-all">
                    {showPassword ? password : '••••••••••••••••'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={onTogglePassword}
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs shrink-0"
                    onClick={onCopy}
                  >
                    {copied ? (
                      <Check size={14} className="mr-1" />
                    ) : (
                      <Copy size={14} className="mr-1" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              <p
                className={`text-xs font-semibold mt-2 ${
                  isSupergod
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}
              >
                {isSupergod
                  ? '⚠️ Supreme Administrator - Multi-tenant control. Login and change password IMMEDIATELY!'
                  : `⚠️ Login and change your password IMMEDIATELY! These credentials will disappear in ${timeRemaining}.`}
              </p>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
