'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { VaultShell } from '../VaultShell'

export default function VaultRoutePage() {
  return (
    <WorkspacePageSlot path="/vault">
      <LevelGate minLevel={1} levelName="User">
        <VaultShell />
      </LevelGate>
    </WorkspacePageSlot>
  )
}
