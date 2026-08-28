'use client'

import { ColorSwatch } from './ColorSwatch'
import type { ThemeColors } from './useThemeEditor'
import s from './ThemeEditor.module.scss'

interface SwatchListProps {
  colors: ThemeColors
  tab: 'light' | 'dark'
  onChange: (tab: 'light' | 'dark', key: string, val: string) => void
}

export function SwatchList({ colors, tab, onChange }: SwatchListProps) {
  return (
    <div className={s.swatchList}>
      {Object.entries(colors).map(([k, v]) => (
        <ColorSwatch
          key={k}
          varName={k}
          value={v}
          onChange={(key, val) => {
            onChange(tab, key, val)
          }}
        />
      ))}
    </div>
  )
}
