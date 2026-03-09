import { Card, Button, Chip, MaterialIcon } from '@metabuilder/components/fakemui'
import { useState } from 'react'
import styles from './ContentGridsShowcase.module.scss'

export function ContentGridsShowcase() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="content-grids-showcase" role="region" aria-label="Content grids showcase">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Content Grids</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Switchable grid and list views with filtering
        </p>
      </div>

      <Card>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--mat-sys-outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontWeight: 600, fontSize: '1.125rem', lineHeight: '1.75rem' }}>Projects</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant={viewMode === 'grid' ? 'filled' : 'outlined'}
                onClick={() => setViewMode('grid')}
              >
                <MaterialIcon name="grid_view" aria-hidden="true" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'filled' : 'outlined'}
                onClick={() => setViewMode('list')}
              >
                <MaterialIcon name="list" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className={styles.projectGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className={styles.projectCard}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ height: '128px', borderRadius: '12px', background: 'linear-gradient(to bottom right, var(--mat-sys-primary), var(--mat-sys-secondary-container))' }} />
                  <h4 style={{ fontWeight: 600 }}>Project {i}</h4>
                  <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    A brief description of this project and its goals.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
                    <Chip variant="outlined">Active</Chip>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ borderTop: '1px solid var(--mat-sys-outline-variant)' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.listItem} style={{ borderBottom: '1px solid var(--mat-sys-outline-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ height: '64px', width: '64px', borderRadius: '12px', background: 'linear-gradient(to bottom right, var(--mat-sys-primary), var(--mat-sys-secondary-container))', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 600 }}>Project {i}</h4>
                    <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
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
        )}
      </Card>
    </section>
  )
}
