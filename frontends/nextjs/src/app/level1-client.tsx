'use client'

import { Level1 } from '@/components/Level1'
import { useRouter } from 'next/navigation'
import { getLevelPath } from '@/lib/navigation/get-level-path'
import type { AppLevel } from '@/lib/level-types'

export function Level1Client() {
  const router = useRouter()
  
  const handleNavigate = (level: number) => {
    const normalizedLevel = Math.min(5, Math.max(1, level)) as AppLevel
    router.push(getLevelPath(normalizedLevel))
  }

  return <Level1 onNavigate={handleNavigate} />
}
