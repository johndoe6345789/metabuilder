'use client'

import s from '../EpgGrid.module.scss'

export interface NowLineProps {
  nowPct: number
}

export function NowLine({ nowPct }: NowLineProps) {
  return (
    <div
      className={s.nowLine}
      style={{
        left: `calc(168px + (100% - 168px) * ${(nowPct / 100).toString()})`,
      }}
    />
  )
}
