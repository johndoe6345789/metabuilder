import type { RetroSystem } from '@/hooks/useRetroSession'
import s from './SystemPicker.module.scss'

interface System {
  id: RetroSystem
  label: string
  era: string
}

const SYSTEMS: System[] = [
  { id: 'nes',     label: 'NES',       era: '1983' },
  { id: 'snes',    label: 'SNES',      era: '1990' },
  { id: 'gb',      label: 'Game Boy',  era: '1989' },
  { id: 'gba',     label: 'GBA',       era: '2001' },
  { id: 'genesis', label: 'Genesis',   era: '1988' },
  { id: 'ps1',     label: 'PS1',       era: '1994' },
  { id: 'n64',     label: 'N64',       era: '1996' },
  { id: 'arcade',  label: 'Arcade',    era: 'MAME' },
]

interface Props {
  value: RetroSystem | null
  onChange: (s: RetroSystem) => void
}

export function SystemPicker({ value, onChange }: Props) {
  return (
    <div className={s.grid}>
      {SYSTEMS.map(sys => (
        <button
          key={sys.id}
          type="button"
          className={`${s.card} ${value === sys.id ? s.selected : ''}`}
          onClick={() => { onChange(sys.id) }}
        >
          <span className={s.label}>{sys.label}</span>
          <span className={s.era}>{sys.era}</span>
        </button>
      ))}
    </div>
  )
}
