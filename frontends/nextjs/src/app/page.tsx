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
    // PageConfig, not page_config: DBAL resolves the entity by its schema's
    // "entity" name, so the snake_case filename answered 422 and the .catch
    // below swallowed it -- the page rendered while the requiresAuth
    // redirect silently never ran. The package segment is only checked for
    // shape (rpc_restful_handler.cpp), so "core" here matches the twenty
    // other call sites; this one used to say "access" and read as though
    // one of the two must be broken.
    fetch(`${dbalUrl()}/system/core/PageConfig`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => (res.ok ? res.json() : null))
      .then((json: { data?: PageConfig[] } | null) => {
        const homeRoute = json?.data?.find(
          r => r.path === '/' && r.isPublished === true
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
