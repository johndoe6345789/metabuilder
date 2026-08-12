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
  (typeof process !== 'undefined'
    ? (process.env.NEXT_PUBLIC_DBAL_API_URL ?? null)
    : null) ?? 'http://localhost:8080'

export default function RootPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // access/PageConfig, not core/page_config: the entity is registered from
    // dbal/shared/api/schema/entities/access/page_config.json under its
    // "entity" name, and DBAL routes are /{tenant}/{package}/{Entity}. The old
    // path answered 422 on both counts, and the .catch below swallowed it - the
    // page rendered while the requiresAuth redirect silently never ran.
    fetch(`${dbalUrl()}/system/access/PageConfig`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { data?: PageConfig[] } | null) => {
        const homeRoute = json?.data?.find(
          (r) => r.path === '/' && r.isPublished === true
        )
        if (homeRoute?.requiresAuth === true) {
          router.replace('/login')
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
