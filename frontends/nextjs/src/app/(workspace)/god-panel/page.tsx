'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { GodPanelShell } from './GodPanelShell'

export default function GodPanelPage() {
  return (
    <LevelGate minLevel={4} levelName="God">
      <GodPanelShell />
    </LevelGate>
  )
}
