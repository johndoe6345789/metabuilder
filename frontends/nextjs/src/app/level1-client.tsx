'use client'

import { useRouter } from 'next/navigation'

import { Level1 } from '@/components/Level1'
import type { AppLevel } from '@/lib/level-types'
import { getLevelPath } from '@/lib/navigation/get-level-path'

export function Level1Client() {
  const router = useRouter()

  const handleNavigate = (level: number) => {
    const normalizedLevel = Math.min(6, Math.max(1, level)) as AppLevel
    router.push(getLevelPath(normalizedLevel))
  }

  return <Level1 onNavigate={handleNavigate} />
}
