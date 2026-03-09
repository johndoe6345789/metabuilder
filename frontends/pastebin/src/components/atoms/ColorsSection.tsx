import { Card } from '@metabuilder/components/fakemui'
import styles from './ColorsSection.module.scss'

export function ColorsSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="colors-section" role="region" aria-label="Colors palette">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Colors</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Semantic color palette with accessibility in mind
        </p>
      </div>

      <Card className="p-6">
        <div className={styles.colorsGrid}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '96px', borderRadius: '12px', backgroundColor: 'var(--mat-sys-primary)' }} />
            <div>
              <p style={{ fontWeight: 500 }}>Primary</p>
              <code style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>
                oklch(0.50 0.18 310)
              </code>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '96px', borderRadius: '12px', backgroundColor: 'var(--mat-sys-secondary)' }} />
            <div>
              <p style={{ fontWeight: 500 }}>Secondary</p>
              <code style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>
                oklch(0.30 0.08 310)
              </code>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '96px', borderRadius: '12px', backgroundColor: 'var(--mat-sys-secondary-container)' }} />
            <div>
              <p style={{ fontWeight: 500 }}>Accent</p>
              <code style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>
                oklch(0.72 0.20 25)
              </code>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '96px', borderRadius: '12px', backgroundColor: 'var(--mat-sys-error)' }} />
            <div>
              <p style={{ fontWeight: 500 }}>Destructive</p>
              <code style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>
                oklch(0.577 0.245 27.325)
              </code>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '96px', borderRadius: '12px', backgroundColor: 'var(--mat-sys-surface-variant)' }} />
            <div>
              <p style={{ fontWeight: 500 }}>Muted</p>
              <code style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>
                oklch(0.25 0.06 310)
              </code>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '96px', borderRadius: '12px', backgroundColor: 'var(--mat-sys-surface-container)', border: '1px solid var(--mat-sys-outline-variant)' }} />
            <div>
              <p style={{ fontWeight: 500 }}>Card</p>
              <code style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>
                oklch(0.20 0.12 310)
              </code>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
