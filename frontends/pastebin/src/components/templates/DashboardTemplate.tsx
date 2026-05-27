import { Card, Button, MaterialIcon } from '@metabuilder/components/fakemui'
import { DashboardStatsGrid } from './DashboardStatsGrid'
import { DashboardRecentActivity } from './DashboardRecentActivity'
import { DashboardQuickActions } from './DashboardQuickActions'
import { DashboardHeader } from './DashboardHeader'
import { DashboardSidebar } from './DashboardSidebar'
import styles from './DashboardTemplate.module.scss'

export function DashboardTemplate() {
  return (
    <Card
      style={{ overflow: 'hidden' }}
      data-testid="dashboard-template"
      role="main"
      aria-label="Dashboard template"
    >
      <DashboardHeader />

      <div style={{ display: 'flex' }}>
        <DashboardSidebar />

        <main style={{ flex: 1, padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h1 style={{
                  fontSize: '1.875rem',
                  lineHeight: '2.25rem',
                  fontWeight: 700,
                }}>
                  Overview
                </h1>
                <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
                  Welcome back, here&apos;s what&apos;s happening
                </p>
              </div>
              <Button>
                <MaterialIcon name="add" style={{ marginRight: '8px' }} />
                New Project
              </Button>
            </div>

            <DashboardStatsGrid className={styles.statsGrid} />

            <div className={styles.activityGrid}>
              <DashboardRecentActivity />
              <DashboardQuickActions />
            </div>
          </div>
        </main>
      </div>
    </Card>
  )
}
