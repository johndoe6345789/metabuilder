import { Alert, AlertDescription, Badge } from '@/components/ui'
import { CheckCircle, WarningCircle } from '@phosphor-icons/react'

export interface GodCredentialsSummaryProps {
  isActive: boolean
  expiryTime: number
  timeRemaining: string
}

export function GodCredentialsSummary({ isActive, expiryTime, timeRemaining }: GodCredentialsSummaryProps) {
  if (isActive) {
    return (
      <Alert className="bg-gradient-to-br from-purple-500/10 to-orange-500/10 border-purple-500/50">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <AlertDescription className="ml-2">
          <div className="space-y-1">
            <p className="font-semibold text-sm flex items-center gap-2">
              God credentials are currently visible
              <Badge variant="secondary" className="font-mono">Active</Badge>
            </p>
            <p className="text-xs text-muted-foreground">
              Time remaining: <span className="font-mono font-semibold">{timeRemaining}</span>
            </p>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (!isActive && expiryTime > 0) {
    return (
      <Alert>
        <WarningCircle className="h-5 w-5 text-yellow-500" />
        <AlertDescription className="ml-2">
          <p className="text-sm">God credentials have expired or been hidden</p>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
