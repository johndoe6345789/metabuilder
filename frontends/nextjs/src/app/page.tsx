'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WelcomePage } from '@/components/WelcomePage'

interface PageConfig {
  path: string
  title: string
  component: string
  packageId: string
  requiresAuth: boolean
  isPublished: boolean
  level: number
}

const dbalUrl = () =>
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DBAL_API_URL) ||
  'http://localhost:8080'

export default function RootPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetch(`${dbalUrl()}/system/core/page_config`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { data?: PageConfig[] } | null) => {
        const homeRoute = json?.data?.find(
          (r) => r.path === '/' && r.isPublished === true
        )
        if (homeRoute?.requiresAuth) {
          router.replace('/ui/login')
          return
        }
        setReady(true)
      })
      .catch(() => {
        setReady(true)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) {
    return null
  }

  return <WelcomePage />
}
