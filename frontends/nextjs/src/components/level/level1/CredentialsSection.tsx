'use client'

import { useEffect, useState } from 'react'
import { getScrambledPassword } from '@/lib/auth'
import { GodCredentialsBanner } from '../level1/GodCredentialsBanner'
import { ChallengePanel } from '../sections/ChallengePanel'

export function CredentialsSection() {
  const [showGodCredentials, setShowGodCredentials] = useState(false)
  const [showSuperGodCredentials, setShowSuperGodCredentials] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSuperGodPassword, setShowSuperGodPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedSuper, setCopiedSuper] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined

    const checkCredentials = async () => {
      try {
        const { Database } = await import('@/lib/database')

        const shouldShow = await Database.shouldShowGodCredentials()
        setShowGodCredentials(shouldShow)

        const superGod = await Database.getSuperGod()
        const firstLoginFlags = await Database.getFirstLoginFlags()
        setShowSuperGodCredentials(superGod !== null && firstLoginFlags['supergod'] === true)

        if (shouldShow) {
          const expiry = await Database.getGodCredentialsExpiry()
          const updateTimer = () => {
            const now = Date.now()
            const diff = expiry - now

            if (diff <= 0) {
              setShowGodCredentials(false)
              setTimeRemaining('')
              return
            }

            const minutes = Math.floor(diff / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)
            setTimeRemaining(`${minutes}m ${seconds}s`)
          }

          updateTimer()
          interval = setInterval(updateTimer, 1000)
        }
      } catch {
        setShowGodCredentials(false)
        setShowSuperGodCredentials(false)
        setTimeRemaining('')
      }
    }

    void checkCredentials()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  const handleCopyPassword = async () => {
    await navigator.clipboard.writeText(getScrambledPassword('god'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopySuperGodPassword = async () => {
    await navigator.clipboard.writeText(getScrambledPassword('supergod'))
    setCopiedSuper(true)
    setTimeout(() => setCopiedSuper(false), 2000)
  }

  if (!showGodCredentials && !showSuperGodCredentials) return null

  return (
    <ChallengePanel
      title="Setup Credentials"
      description="Temporary credentials are available while configuring your environment."
    >
      <div className="space-y-4">
        {showSuperGodCredentials && (
          <GodCredentialsBanner
            username="supergod"
            password={getScrambledPassword('supergod')}
            showPassword={showSuperGodPassword}
            onTogglePassword={() => setShowSuperGodPassword(!showSuperGodPassword)}
            copied={copiedSuper}
            onCopy={handleCopySuperGodPassword}
            timeRemaining=""
            variant="supergod"
          />
        )}

        {showGodCredentials && (
          <GodCredentialsBanner
            username="god"
            password={getScrambledPassword('god')}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            copied={copied}
            onCopy={handleCopyPassword}
            timeRemaining={timeRemaining}
            variant="god"
          />
        )}
      </div>
    </ChallengePanel>
  )
}
