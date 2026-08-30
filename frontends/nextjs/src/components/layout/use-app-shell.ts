'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PackageNavItem } from '@/lib/packages/navigation'
import { fetchDbalHealth, fetchNavigablePackages } from './app-shell-data'
import { isNarrowViewport, useNarrowViewport } from './use-narrow-viewport'
import { useShellIdentity } from './use-shell-identity'

export type AppShellState = ReturnType<typeof useAppShell>

/** Everything AppShell needs that isn't pure layout. */
export function useAppShell() {
  const identity = useShellIdentity()
  const router = useRouter()

  // Starts closed so the server and the first client render agree; the
  // effect below opens it on wide viewports. Reading window.innerWidth in
  // the initial state instead made narrow clients hydrate against a server
  // render that had assumed `true`.
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dbalOffline, setDbalOffline] = useState(false)
  const [packages, setPackages] = useState<PackageNavItem[]>([])

  useEffect(() => {
    void fetchDbalHealth().then(setDbalOffline)
    void fetchNavigablePackages().then(setPackages)
  }, [])

  useNarrowViewport(
    useCallback(narrow => {
      setSidebarOpen(!narrow)
    }, [])
  )

  const logout = useCallback(async () => {
    await identity.auth.logout()
    router.push('/')
  }, [identity.auth, router])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  // Checked at click time rather than read from state, so following a
  // link always closes the drawer on a narrow viewport even if the
  // breakpoint listener never fired.
  const navigate = useCallback(() => {
    if (isNarrowViewport()) setSidebarOpen(false)
  }, [])

  return {
    ...identity,
    dbalOffline,
    packages,
    // The grid column must track whether the Sidebar actually renders,
    // not just whether it is toggled open -- logged out it renders
    // nothing, and reserving the column anyway left a 288px dead gap
    // beside every public page.
    showSidebar: identity.auth.isAuthenticated && sidebarOpen,
    toggleSidebar,
    navigate,
    logout,
  }
}
