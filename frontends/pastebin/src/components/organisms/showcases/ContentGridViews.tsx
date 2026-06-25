import { Card, Button, Chip } from '@metabuilder/components/m3'
import styles from './ContentGridsShowcase.module.scss'

const GRADIENT = {
  background:
    'linear-gradient(to bottom right, ' +
    'var(--mat-sys-primary), var(--mat-sys-secondary-container))',
}
const thumbStyle = { ...GRADIENT, height: '128px', borderRadius: '12px' }
const thumbSmStyle = {
  ...GRADIENT,
  height: '64px',
  width: '64px',
  borderRadius: '12px',
  flexShrink: 0 as const,
}
const descStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  color: 'var(--mat-sys-on-surface-variant)',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}
const ITEMS = [1, 2, 3, 4, 5, 6]

export function ProjectGridView() {
  return (
    <div className={styles.projectGrid}>
      {ITEMS.map(i => (
        <Card key={i} className={styles.projectCard}>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div style={thumbStyle} />
            <h4 style={{ fontWeight: 600 }}>Project {i}</h4>
            <p style={descStyle}>
              A brief description of this project and its goals.
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
              }}
            >
              <Chip variant="outlined">Active</Chip>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function ProjectListView() {
  return (
    <div style={{ borderTop: '1px solid var(--mat-sys-outline-variant)' }}>
      {ITEMS.map(i => (
        <div
          key={i}
          className={styles.listItem}
          style={{ borderBottom: '1px solid var(--mat-sys-outline-variant)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={thumbSmStyle} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontWeight: 600 }}>Project {i}</h4>
              <p
                style={{
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem',
                  color: 'var(--mat-sys-on-surface-variant)',
                }}
              >
                A brief description of this project
              </p>
            </div>
            <Chip variant="outlined">Active</Chip>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
