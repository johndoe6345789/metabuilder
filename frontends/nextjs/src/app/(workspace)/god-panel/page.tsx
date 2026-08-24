'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { DEFAULT_GOD_PANEL_TAB } from '@/lib/tenant/workspace-paths'
import { GodPanelShell } from './GodPanelShell'

export default function GodPanelPage() {
  return (
    <LevelGate minLevel={4} levelName="God">
      <GodPanelShell activeTabId={DEFAULT_GOD_PANEL_TAB} />
    </LevelGate>
  )
}
