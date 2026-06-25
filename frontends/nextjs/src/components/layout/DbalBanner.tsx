/**
 * DBAL Offline Banner
 * Mirrors the Qt6 App.qml dbalBanner Rectangle
 * Shown when DBAL daemon is unreachable
 */
'use client'

import { Typography } from '@/m3'

export interface DbalBannerProps {
  visible: boolean
}

export function DbalBanner({ visible }: DbalBannerProps) {
  if (!visible) return null

  return (
    <div
      style={{
        backgroundColor: '#e65100',
        color: '#ffffff',
        textAlign: 'center',
        padding: '4px 0',
        fontSize: '0.75rem',
        zIndex: 1300,
      }}
    >
      <Typography variant="caption" sx={{ color: '#fff' }}>
        DBAL Offline &mdash; showing cached data
      </Typography>
    </div>
  )
}
