import { Card, Button, Chip, MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './TaskListsShowcase.module.scss'

export function TaskListsShowcase() {
  return (
    <section className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="task-lists-showcase" role="region" aria-label="Task lists showcase">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Task Lists</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Interactive lists with status and actions
        </p>
      </div>

      <Card>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--mat-sys-outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontWeight: 600, fontSize: '1.125rem', lineHeight: '1.75rem' }}>Project Tasks</h3>
            <Button size="sm">
              <MaterialIcon name="add" style={{ marginRight: '8px' }} aria-hidden="true" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="divide-y">
          <div className={`${styles.taskItem} hover:bg-muted`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <MaterialIcon name="check_circle" size={24} style={{ color: 'var(--mat-sys-secondary-container)', marginTop: '2px' }} aria-hidden="true" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontWeight: 500 }}>Design system documentation</h4>
                <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)', marginTop: '4px' }}>
                  Complete the component library documentation
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                  <Chip color="secondary">Design</Chip>
                  <span style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>Completed</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.taskItem} hover:bg-muted`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <MaterialIcon name="schedule" size={24} style={{ color: 'var(--mat-sys-secondary-container)', marginTop: '2px' }} aria-hidden="true" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontWeight: 500 }}>API integration</h4>
                <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)', marginTop: '4px' }}>
                  Connect frontend to backend services
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                  <Chip>Development</Chip>
                  <span style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>In Progress</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.taskItem} hover:bg-muted`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <MaterialIcon name="cancel" size={24} style={{ color: 'var(--mat-sys-error)', marginTop: '2px' }} aria-hidden="true" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontWeight: 500 }}>Performance optimization</h4>
                <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)', marginTop: '4px' }}>
                  Improve page load times and reduce bundle size
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                  <Chip color="error">Blocked</Chip>
                  <span style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>Needs review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
