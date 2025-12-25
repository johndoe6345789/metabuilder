'use client'

import { Level1 } from '@/components/Level1'
import { useRouter } from 'next/navigation'

export function Level1Client() {
  const router = useRouter()
  
  const handleNavigate = (level: number) => {
    if (level === 1) {
      router.push('/')
    } else if (level === 2) {
      router.push('/login')
    } else if (level === 3) {
      router.push('/login')
    } else if (level === 4) {
      router.push('/login')
    } else if (level === 5) {
      router.push('/login')
    }
  }

  return <Level1 onNavigate={handleNavigate} />
}
