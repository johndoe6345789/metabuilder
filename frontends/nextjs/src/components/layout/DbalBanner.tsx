/**
 * DBAL Offline Banner
 * Mirrors the Qt6 App.qml dbalBanner Rectangle
 * Shown when DBAL daemon is unreachable
 */
'use client'

import { Typography } from '@/m3'
import s from './DbalBanner.module.scss'

export interface DbalBannerProps {
  visible: boolean
}

export function DbalBanner({ visible }: DbalBannerProps) {
  if (!visible) return null

  return (
    <div className={s.root}>
      <Typography variant="caption" className={s.text}>
        DBAL Offline &mdash; showing cached data
      </Typography>
    </div>
  )
}
