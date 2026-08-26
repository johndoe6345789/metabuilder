'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { LevelGate } from '@/components/layout/LevelGate'
import { godPanelConfig } from '@/lib/packages/navigation'
import { GodPanelShell } from '../GodPanelShell'

/**
 * One God Panel tab, addressed by its own URL: /{tenant}/god-panel/{tab}.
 * The tab id in the path is the single source of truth for which panel is
 * showing -- see use-god-panel-state.ts.
 */
export default function GodPanelTabPage({
  params,
}: {
  params: Promise<{ tab: string }>
}) {
  const { tab } = use(params)

  // An unknown tab is a bad URL, not a reason to silently show Overview.
  if (!godPanelConfig.tabs.some(t => t.id === tab)) {
    notFound()
  }

  return (
    <LevelGate minLevel={4} levelName="God">
      <GodPanelShell activeTabId={tab} />
    </LevelGate>
  )
}
