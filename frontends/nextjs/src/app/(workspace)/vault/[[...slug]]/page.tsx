'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { VaultShell } from '../VaultShell'

export default function VaultRoutePage() {
  return (
    <LevelGate minLevel={1} levelName="User">
      <VaultShell />
    </LevelGate>
  )
}
