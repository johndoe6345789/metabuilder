'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { DashboardContent } from '@/app/[tenantSlug]/panel/dashboard/page'

/** /{tenant}/panel — the workspace itself, inside the app shell. */
export default function PanelHome() {
  return (
    <LevelGate minLevel={1} levelName="User">
      <DashboardContent />
    </LevelGate>
  )
}
