'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DEFAULT_GOD_PANEL_TAB,
  normalizeTenantId,
  tenantGodPanelPath,
} from '@/lib/tenant/workspace-paths'

export function useGodPanelRedirect(
  tenantSlug: string | undefined,
  tenantId: string | undefined,
  isLoading: boolean
) {
  const router = useRouter()

  useEffect(() => {
    if (tenantSlug !== undefined || isLoading || tenantId === undefined) return
    router.replace(
      tenantGodPanelPath(normalizeTenantId(tenantId), DEFAULT_GOD_PANEL_TAB)
    )
  }, [tenantSlug, isLoading, tenantId, router])
}
