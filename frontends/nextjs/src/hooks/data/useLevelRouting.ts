import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { AppLevel } from '@/lib/level-types'
import { getLevelPath } from '@/lib/navigation/get-level-path'
import { useAuth } from '../useAuth'

export interface LevelRouting {
  onNavigate: (level: AppLevel) => void
  onPreview: (level: AppLevel) => void
  onLogout: () => Promise<void>
}

export function useLevelRouting(): LevelRouting {
  const router = useRouter()
  const { logout } = useAuth()

  const onNavigate = useCallback(
    (level: AppLevel) => {
      router.push(getLevelPath(level))
    },
    [router]
  )

  const onPreview = useCallback(
    (level: AppLevel) => {
      router.push(getLevelPath(level))
    },
    [router]
  )

  const onLogout = useCallback(async () => {
    await logout()
    router.push('/')
  }, [logout, router])

  return { onNavigate, onPreview, onLogout }
}
