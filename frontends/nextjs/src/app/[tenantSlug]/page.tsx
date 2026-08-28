'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import {
  normalizeTenantId,
  tenantPanelPath,
} from '@/lib/tenant/workspace-paths'

/**
 * /{tenant} — the tenant's published home page.
 *
 * Deliberately outside the panel: this is a page someone built and published,
 * so it renders on its own, without the app bar or sidebar. Those belong to
 * the builder, not to what the builder produced. The chrome lives under
 * /{tenant}/panel.
 *
 * With nothing published for "/", there is no page to show a visitor, so a
 * signed-in user is sent to the panel and everyone else sees nothing.
 */
export default function TenantHomePage() {
  const params = useParams<{ tenantSlug?: string }>()
  const router = useRouter()
  const tenant = normalizeTenantId(params.tenantSlug)

  return (
    <WorkspacePageSlot tenant={tenant} path="/">
      <NoHomePage
        onGoToPanel={() => {
          router.replace(tenantPanelPath(tenant))
        }}
      />
    </WorkspacePageSlot>
  )
}

function NoHomePage({ onGoToPanel }: { onGoToPanel: () => void }) {
  useEffect(() => {
    onGoToPanel()
  }, [onGoToPanel])
  return null
}
