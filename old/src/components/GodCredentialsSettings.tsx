import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database } from '@/lib/database'
import { toast } from 'sonner'
import { Clock, Key, WarningCircle, CheckCircle } from '@phosphor-icons/react'

export function GodCredentialsSettings() {
  const [duration, setDuration] = useState<number>(60)
  const [unit, setUnit] = useState<'minutes' | 'hours'>('minutes')
  const [expiryTime, setExpiryTime] = useState<number>(0)
  const [isActive, setIsActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (isActive && expiryTime > 0) {
      const interval = setInterval(() => {
        updateTimeRemaining()
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isActive, expiryTime])

  const loadSettings = async () => {
    const currentDuration = await Database.getGodCredentialsExpiryDuration()
    const currentExpiry = await Database.getGodCredentialsExpiry()
    const shouldShow = await Database.shouldShowGodCredentials()

    if (currentDuration >= 60 * 60 * 1000) {
      setDuration(currentDuration / (60 * 60 * 1000))
      setUnit('hours')
    } else {
      setDuration(currentDuration / (60 * 1000))
      setUnit('minutes')
    }

    setExpiryTime(currentExpiry)
    setIsActive(shouldShow)
    updateTimeRemaining(currentExpiry)
  }

  const updateTimeRemaining = (expiry?: number) => {
    const expiryToUse = expiry || expiryTime
    const now = Date.now()
    const diff = expiryToUse - now

    if (diff <= 0) {
      setTimeRemaining('Expired')
      setIsActive(false)
    } else {
      const hours = Math.floor(diff / (60 * 60 * 1000))
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
      const seconds = Math.floor((diff % (60 * 1000)) / 1000)
      
      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      }
    }
  }

  const handleSave = async () => {
    const durationMs = unit === 'hours' 
      ? duration * 60 * 60 * 1000 
      : duration * 60 * 1000

    if (durationMs < 60000) {
      toast.error('Duration must be at least 1 minute')
      return
    }

    if (durationMs > 24 * 60 * 60 * 1000) {
      toast.error('Duration cannot exceed 24 hours')
      return
    }

    await Database.setGodCredentialsExpiryDuration(durationMs)
    toast.success('Credentials expiry duration updated')
    await loadSettings()
  }

  const handleResetExpiry = async () => {
    await Database.resetGodCredentialsExpiry()
    toast.success('God credentials expiry time reset')
    await loadSettings()
  }

  const handleClearExpiry = async () => {
    await Database.setGodCredentialsExpiry(0)
    toast.info('God credentials expiry cleared')
    await loadSettings()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          <CardTitle>God Credentials Expiry Settings</CardTitle>
        </div>
        <CardDescription>
          Configure how long the god-tier login credentials are displayed on the front page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isActive && (
          <Alert className="bg-gradient-to-br from-purple-500/10 to-orange-500/10 border-purple-500/50">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <AlertDescription className="ml-2">
              <div className="space-y-1">
                <p className="font-semibold text-sm">
                  God credentials are currently visible on the front page
                </p>
                <p className="text-xs text-muted-foreground">
                  Time remaining: <span className="font-mono font-semibold">{timeRemaining}</span>
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!isActive && expiryTime > 0 && (
          <Alert>
            <WarningCircle className="h-5 w-5 text-yellow-500" />
            <AlertDescription className="ml-2">
              <p className="text-sm">
                God credentials have expired or been hidden
              </p>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Expiry Duration</Label>
            <div className="flex gap-2">
              <Input
                id="duration"
                type="number"
                min="1"
                max={unit === 'hours' ? '24' : '1440'}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex-1"
              />
              <Select value={unit} onValueChange={(v) => setUnit(v as 'minutes' | 'hours')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Set the duration for how long credentials are visible (1 minute to 24 hours)
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Clock className="mr-2" size={16} />
              Save Duration
            </Button>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="space-y-2">
            <Label>Expiry Management</Label>
            <p className="text-xs text-muted-foreground">
              Reset or clear the current expiry timer
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleResetExpiry} variant="outline" className="flex-1">
              Reset Timer
            </Button>
            <Button onClick={handleClearExpiry} variant="outline" className="flex-1">
              Clear Expiry
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            <strong>Reset Timer:</strong> Restart the countdown using the configured duration<br />
            <strong>Clear Expiry:</strong> Remove expiry time (credentials will show on next page load)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
