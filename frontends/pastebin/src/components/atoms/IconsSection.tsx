import { Card, MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './IconsSection.module.scss'

export function IconsSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="icons-section" role="region" aria-label="Icon gallery">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Icons</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Material Symbols icon set
        </p>
      </div>

      <Card className="p-6">
        <div className={styles.iconsGrid}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <MaterialIcon name="favorite" size={32} aria-hidden="true" />
            <span style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>Heart</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <MaterialIcon name="star" size={32} aria-hidden="true" />
            <span style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>Star</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <MaterialIcon name="bolt" size={32} aria-hidden="true" />
            <span style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>Lightning</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <MaterialIcon name="check" size={32} aria-hidden="true" />
            <span style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>Check</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <MaterialIcon name="close" size={32} aria-hidden="true" />
            <span style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>X</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <MaterialIcon name="add" size={32} aria-hidden="true" />
            <span style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>Plus</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <MaterialIcon name="remove" size={32} aria-hidden="true" />
            <span style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>Minus</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <MaterialIcon name="search" size={32} aria-hidden="true" />
            <span style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>Search</span>
          </div>
        </div>
      </Card>
    </section>
  )
}
