import { Card } from '@metabuilder/components/fakemui'
import styles from './ColorsSection.module.scss'

const codeStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  lineHeight: '1rem',
  color: 'var(--mat-sys-on-surface-variant)',
}

const swatchBase: React.CSSProperties = {
  height: '96px',
  borderRadius: '12px',
}

const COLOR_SWATCHES = [
  {
    label: 'Primary',
    code: 'oklch(0.50 0.18 310)',
    style: { ...swatchBase, backgroundColor: 'var(--mat-sys-primary)' },
  },
  {
    label: 'Secondary',
    code: 'oklch(0.30 0.08 310)',
    style: {
      ...swatchBase,
      backgroundColor: 'var(--mat-sys-secondary)',
    },
  },
  {
    label: 'Accent',
    code: 'oklch(0.72 0.20 25)',
    style: {
      ...swatchBase,
      backgroundColor: 'var(--mat-sys-secondary-container)',
    },
  },
  {
    label: 'Destructive',
    code: 'oklch(0.577 0.245 27.325)',
    style: { ...swatchBase, backgroundColor: 'var(--mat-sys-error)' },
  },
  {
    label: 'Muted',
    code: 'oklch(0.25 0.06 310)',
    style: {
      ...swatchBase,
      backgroundColor: 'var(--mat-sys-surface-variant)',
    },
  },
  {
    label: 'Card',
    code: 'oklch(0.20 0.12 310)',
    style: {
      ...swatchBase,
      backgroundColor: 'var(--mat-sys-surface-container)',
      border: '1px solid var(--mat-sys-outline-variant)',
    },
  },
] as const

export function ColorsSection() {
  return (
    <section
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      data-testid="colors-section"
      role="region"
      aria-label="Colors palette"
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
          Colors
        </h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Semantic color palette with accessibility in mind
        </p>
      </div>

      <Card className="p-6">
        <div className={styles.colorsGrid}>
          {COLOR_SWATCHES.map(({ label, code, style }) => (
            <div
              key={label}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div style={style} />
              <div>
                <p style={{ fontWeight: 500 }}>{label}</p>
                <code style={codeStyle}>{code}</code>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
