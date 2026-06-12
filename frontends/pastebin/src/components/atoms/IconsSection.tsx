import { Card, MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './IconsSection.module.scss'

const ICON_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.75rem',
  lineHeight: '1rem',
  color: 'var(--mat-sys-on-surface-variant)',
}

const ICONS = [
  { name: 'favorite', label: 'Heart' },
  { name: 'star', label: 'Star' },
  { name: 'bolt', label: 'Lightning' },
  { name: 'check', label: 'Check' },
  { name: 'close', label: 'X' },
  { name: 'add', label: 'Plus' },
  { name: 'remove', label: 'Minus' },
  { name: 'search', label: 'Search' },
] as const

export function IconsSection() {
  return (
    <section
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      data-testid="icons-section"
      role="region"
      aria-label="Icon gallery"
    >
      <div>
        <h2
          style={{
            fontSize: '1.875rem',
            lineHeight: '2.25rem',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          Icons
        </h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Material Symbols icon set
        </p>
      </div>

      <Card className="p-6">
        <div className={styles.iconsGrid}>
          {ICONS.map(({ name, label }) => (
            <div key={name} style={ICON_STYLE}>
              <MaterialIcon name={name} size={32} aria-hidden="true" />
              <span style={LABEL_STYLE}>{label}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
