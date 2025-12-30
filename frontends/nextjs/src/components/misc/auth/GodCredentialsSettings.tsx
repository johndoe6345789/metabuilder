import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { GodCredentialsForm } from '@/components/auth/god-credentials/Form'
import { GodCredentialsSummary } from '@/components/auth/god-credentials/Summary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Key } from '@/fakemui/icons'
import { Database } from '@/lib/database'

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
    const durationMs = unit === 'hours' ? duration * 60 * 60 * 1000 : duration * 60 * 1000

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
        <GodCredentialsSummary
          isActive={isActive}
          expiryTime={expiryTime}
          timeRemaining={timeRemaining}
        />

        <GodCredentialsForm
          duration={duration}
          unit={unit}
          onDurationChange={setDuration}
          onUnitChange={setUnit}
          onSave={handleSave}
          onResetExpiry={handleResetExpiry}
          onClearExpiry={handleClearExpiry}
        />
      </CardContent>
    </Card>
  )
}
