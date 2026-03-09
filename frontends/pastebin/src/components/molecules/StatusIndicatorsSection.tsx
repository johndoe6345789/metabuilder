import { Card, Chip, Divider } from '@metabuilder/components/fakemui'
import styles from './StatusIndicatorsSection.module.scss'

export function StatusIndicatorsSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="status-indicators-section" role="region" aria-label="Status indicator examples">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Status Indicators</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Combined elements showing status and information
        </p>
      </div>

      <Card className="p-6">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className={styles.pulse} style={{ width: '12px', height: '12px', borderRadius: '9999px', backgroundColor: 'var(--mat-sys-secondary-container)' }} />
              <span style={{ fontWeight: 500 }}>System Online</span>
            </div>
            <Chip>Active</Chip>
          </div>

          <Divider />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '9999px', backgroundColor: 'var(--mat-sys-error)' }} />
              <span style={{ fontWeight: 500 }}>Service Unavailable</span>
            </div>
            <Chip color="error">Error</Chip>
          </div>

          <Divider />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '9999px', backgroundColor: 'var(--mat-sys-surface-variant)' }} />
              <span style={{ fontWeight: 500 }}>Maintenance Mode</span>
            </div>
            <Chip color="secondary">Scheduled</Chip>
          </div>
        </div>
      </Card>
    </section>
  )
}
