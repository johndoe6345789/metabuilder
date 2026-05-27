import { useState, useEffect } from 'react'
import { DEFAULT_PLATFORM_ID, getPlatform } from '@/config/aiPlatforms'
import { getStorageConfig } from '@/lib/storage'
import { getAuthToken } from '@/lib/authToken'

function baseUrl(): string {
  return (getStorageConfig().dbalUrl ?? '').replace(/\/$/, '')
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function readLocalPlatform(): string {
  if (typeof window === 'undefined') return DEFAULT_PLATFORM_ID
  return localStorage.getItem('ai_platform') || DEFAULT_PLATFORM_ID
}

function readLocalKey(platformId: string): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(`ai_key_${platformId}`) || ''
}

export function useOpenAISettings() {
  const [platformId, setPlatformId] = useState(readLocalPlatform)
  const [apiKey, setApiKey] = useState(() => readLocalKey(readLocalPlatform()))
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [serverKeyStatus, setServerKeyStatus] = useState<
    'unknown' | 'stored' | 'none'
  >('unknown')

  const platform = getPlatform(platformId)

  useEffect(() => {
    const flask = baseUrl()
    const token = getAuthToken()
    if (!flask || !token) { setServerKeyStatus('none'); return }
    setServerKeyStatus('unknown')
    fetch(`${flask}/api/ai/settings`, { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data && data.platformId === platformId && data.hasKey) {
          setServerKeyStatus('stored')
        } else {
          setServerKeyStatus('none')
        }
      })
      .catch(() => setServerKeyStatus('none'))
  }, [platformId])

  const handlePlatformChange = (newId: string) => {
    setPlatformId(newId)
    setApiKey(readLocalKey(newId))
    setSaved(false)
  }

  const handleSave = async () => {
    localStorage.setItem('ai_platform', platformId)
    if (apiKey.trim()) {
      localStorage.setItem(`ai_key_${platformId}`, apiKey.trim())
    } else {
      localStorage.removeItem(`ai_key_${platformId}`)
    }

    const flask = baseUrl()
    const token = getAuthToken()
    if (flask && token) {
      try {
        const r = await fetch(`${flask}/api/ai/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
          body: JSON.stringify({ platformId, apiKey: apiKey.trim() }),
        })
        if (r.ok) {
          setServerKeyStatus(apiKey.trim() ? 'stored' : 'none')
        } else {
          console.warn(
            '[OpenAISettingsCard] server save failed, localStorage is fallback'
          )
        }
      } catch (e) {
        console.warn('[OpenAISettingsCard] server save error:', e)
      }
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = async () => {
    setApiKey('')
    localStorage.removeItem(`ai_key_${platformId}`)

    const flask = baseUrl()
    const token = getAuthToken()
    if (flask && token) {
      try {
        await fetch(`${flask}/api/ai/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
          body: JSON.stringify({ platformId, apiKey: '' }),
        })
        setServerKeyStatus('none')
      } catch (e) {
        console.warn('[OpenAISettingsCard] server clear error:', e)
      }
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const isConfigured =
    !platform.keyRequired || !!apiKey || serverKeyStatus === 'stored'

  return {
    platformId,
    apiKey,
    showKey,
    saved,
    serverKeyStatus,
    platform,
    isConfigured,
    setApiKey,
    setShowKey,
    handlePlatformChange,
    handleSave,
    handleClear,
  }
}
