import { useEffect, useState } from 'react'
import { usePWA } from './use-pwa'
import { toast } from '@/components/ui/sonner'
import copy from '@/data/pwa-settings.json'

export function usePWASettings() {
  const pwa = usePWA()
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    'default'
  )
  const [cacheSize, setCacheSize] = useState<string>(copy.defaults.cacheCalculating)

  useEffect(() => {
    let isMounted = true
    let permissionStatus: PermissionStatus | null = null
    let handlePermissionChange: (() => void) | null = null

    const setPermissionState = (state: PermissionState | NotificationPermission | 'unsupported') => {
      if (!isMounted) return
      if (state === 'prompt') {
        setNotificationPermission('default')
        return
      }
      if (state === 'granted' || state === 'denied' || state === 'default' || state === 'unsupported') {
        setNotificationPermission(state)
      }
    }

    const updatePermission = async () => {
      if (!('Notification' in window)) {
        setPermissionState('unsupported')
        return
      }

      setPermissionState(Notification.permission)

      if ('permissions' in navigator && 'query' in navigator.permissions) {
        try {
          permissionStatus = await navigator.permissions.query({ name: 'notifications' })
          handlePermissionChange = () => setPermissionState(permissionStatus?.state ?? 'default')
          permissionStatus.addEventListener('change', handlePermissionChange)
          handlePermissionChange()
        } catch (error) {
          console.error('[PWA] Notification permission query failed:', error)
        }
      }
    }

    const updateCacheSize = async () => {
      if (!('storage' in navigator && 'estimate' in navigator.storage)) {
        if (isMounted) {
          setCacheSize(copy.defaults.cacheUnavailable)
        }
        return
      }

      try {
        const estimate = await navigator.storage.estimate()
        const usage = estimate.usage
        if (typeof usage !== 'number') {
          setCacheSize(copy.defaults.cacheUnavailable)
          return
        }
        const usageInMB = (usage / (1024 * 1024)).toFixed(2)
        setCacheSize(`${usageInMB} ${copy.cache.storageUnit}`)
      } catch (error) {
        console.error('[PWA] Storage estimate failed:', error)
        if (isMounted) {
          setCacheSize(copy.defaults.cacheUnavailable)
        }
      }
    }

    updatePermission()
    updateCacheSize()

    return () => {
      isMounted = false
      if (permissionStatus && handlePermissionChange) {
        permissionStatus.removeEventListener('change', handlePermissionChange)
      }
    }
  }, [])

  const handleInstall = async () => {
    const success = await pwa.installApp()
    if (success) {
      toast.success(copy.toasts.installSuccess)
    } else {
      toast.error(copy.toasts.installCancelled)
    }
  }

  const handleUpdate = () => {
    pwa.updateApp()
    toast.info(copy.toasts.update)
  }

  const handleClearCache = () => {
    pwa.clearCache()
    toast.success(copy.toasts.cacheCleared)
  }

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!enabled || notificationPermission === 'unsupported') {
      return
    }

    const permission = await pwa.requestNotificationPermission()
    setNotificationPermission(permission)

    if (permission === 'granted') {
      toast.success(copy.toasts.notificationsEnabled)
    } else {
      toast.error(copy.toasts.notificationsDenied)
    }
  }

  const isNotificationSupported = typeof window !== 'undefined' && 'Notification' in window

  return {
    ...pwa,
    notificationPermission,
    cacheSize,
    isNotificationSupported,
    hasRegistration: Boolean(pwa.registration),
    handleInstall,
    handleUpdate,
    handleClearCache,
    handleNotificationToggle,
    copy,
  }
}
