/**
 * Settings Page (Level 1+: User)
 *
 * Mirrors the Qt6 sidebar "Settings" item
 * User-facing settings: theme, notifications, account
 */
'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { Typography } from '@/m3'
import { ThemePanel } from './panels/ThemePanel'
import { AccountPanel } from './panels/AccountPanel'
import { DbalPanel } from './panels/DbalPanel'
import s from './page.module.scss'

function SettingsContent() {
  return (
    <div className={s.root}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <ThemePanel />
      <AccountPanel />
      <DbalPanel />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <LevelGate minLevel={1} levelName="User">
      <SettingsContent />
    </LevelGate>
  )
}
