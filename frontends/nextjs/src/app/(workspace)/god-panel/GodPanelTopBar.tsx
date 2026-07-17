'use client'

import { Button } from '@/m3'
import s from './page.module.scss'

type Props = {
  guideOpen: boolean
  nerdOpen: boolean
  onHome: () => void
  onPreview: (level: number) => void
  onToggleGuide: () => void
  onToggleNerd: () => void
}

export function GodPanelTopBar({
  guideOpen,
  nerdOpen,
  onHome,
  onPreview,
  onToggleGuide,
  onToggleNerd,
}: Props) {
  return (
    <header className={s.topbar}>
      <div className={s.brand}>
        <span className={s.logo} />
        <span className={s.title}>God-Tier Builder</span>
      </div>
      <div className={s.actions}>
        <Button variant="text" size="small" onClick={onHome}>
          ⌂ Home
        </Button>
        <span className={s.previewLabel}>PREVIEW</span>
        <Button variant="outlined" size="small" onClick={() => onPreview(1)}>
          L1
        </Button>
        <Button variant="outlined" size="small" onClick={() => onPreview(2)}>
          L2
        </Button>
        <Button variant="outlined" size="small" onClick={() => onPreview(3)}>
          L3
        </Button>
        <span className={s.divider} />
        <Button
          variant={guideOpen ? 'contained' : 'outlined'}
          size="small"
          onClick={onToggleGuide}
        >
          Walk Me
        </Button>
        <Button
          variant={nerdOpen ? 'contained' : 'outlined'}
          size="small"
          onClick={onToggleNerd}
        >
          ⚡ Nerd Mode
        </Button>
      </div>
    </header>
  )
}
