'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { tenantPanelPath } from '@/lib/tenant/workspace-paths'
import { NothingPublishedYet } from './NothingPublishedYet'

/**
 * What /{tenant} shows when the server did not render the page itself.
 *
 * Two cases reach here, and the slot tells them apart: nothing is
 * published at "/" yet, or something is but this visitor may not see it.
 * The slot re-fetches and applies the same LevelGate the rest of the app
 * uses, so a restricted home page still says so rather than 404ing.
 */
export function TenantHomeFallback({ tenant }: { tenant: string }) {
  return (
    <WorkspacePageSlot tenant={tenant} path="/">
      <NoHomePage tenant={tenant} />
    </WorkspacePageSlot>
  )
}

/**
 * Nothing is published at "/" yet.
 *
 * Someone signed in is almost certainly the founder, and the panel is
 * where they would go to fix that, so they are sent there. A stranger is
 * not: this redirect used to be unconditional, so an anonymous visitor to
 * a community that had not published yet was bounced into the panel and
 * met LevelGate's "Authentication Required" card. The founder's public
 * URL answered the world with a login prompt.
 */
function NoHomePage({ tenant }: { tenant: string }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthContext()

  useEffect(() => {
    if (isLoading || !isAuthenticated) return
    router.replace(tenantPanelPath(tenant))
  }, [isLoading, isAuthenticated, router, tenant])

  // Nothing at all until auth has answered, rather than a notice that is
  // about to be replaced by a redirect.
  if (isLoading || isAuthenticated) return null
  return <NothingPublishedYet />
}
