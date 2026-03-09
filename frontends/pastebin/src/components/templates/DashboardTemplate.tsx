import { Card, Button, Avatar, MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './DashboardTemplate.module.scss'

const fullWidthStart: React.CSSProperties = { width: '100%', justifyContent: 'flex-start' }

export function DashboardTemplate() {
  return (
    <Card style={{ overflow: 'hidden' }} data-testid="dashboard-template" role="main" aria-label="Dashboard template">
      <div style={{ borderBottom: '1px solid var(--mat-sys-outline-variant)', backgroundColor: 'var(--mat-sys-surface-container)', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700 }}>Dashboard</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant="ghost">
              <MaterialIcon name="notifications" />
            </Button>
            <Button variant="ghost">
              <MaterialIcon name="settings" />
            </Button>
            <Avatar style={{ width: '32px', height: '32px' }} src="https://i.pravatar.cc/150?img=4" alt="User">U</Avatar>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <aside className={styles.sidebar}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Button variant="filled" style={fullWidthStart}>
              <MaterialIcon name="home" style={{ marginRight: '8px' }} />
              Overview
            </Button>
            <Button variant="ghost" style={fullWidthStart}>
              <MaterialIcon name="bar_chart" style={{ marginRight: '8px' }} />
              Analytics
            </Button>
            <Button variant="ghost" style={fullWidthStart}>
              <MaterialIcon name="folder" style={{ marginRight: '8px' }} />
              Projects
            </Button>
            <Button variant="ghost" style={fullWidthStart}>
              <MaterialIcon name="group" style={{ marginRight: '8px' }} />
              Team
            </Button>
          </nav>
        </aside>

        <main style={{ flex: 1, padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700 }}>Overview</h1>
                <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
                  Welcome back, here's what's happening
                </p>
              </div>
              <Button>
                <MaterialIcon name="add" style={{ marginRight: '8px' }} />
                New Project
              </Button>
            </div>

            <div className={styles.statsGrid}>
              <Card style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>Total Revenue</p>
                    <p style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginTop: '8px' }}>$45,231</p>
                    <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-secondary-container)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MaterialIcon name="trending_up" size={16} />
                      +20.1% from last month
                    </p>
                  </div>
                </div>
              </Card>

              <Card style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>Active Users</p>
                    <p style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginTop: '8px' }}>2,350</p>
                    <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-secondary-container)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MaterialIcon name="trending_up" size={16} />
                      +12.5% from last month
                    </p>
                  </div>
                </div>
              </Card>

              <Card style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>Total Orders</p>
                    <p style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginTop: '8px' }}>1,234</p>
                    <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-secondary-container)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MaterialIcon name="trending_up" size={16} />
                      +8.2% from last month
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className={styles.activityGrid}>
              <Card>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--mat-sys-outline-variant)' }}>
                  <h3 style={{ fontWeight: 600 }}>Recent Activity</h3>
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <Avatar style={{ width: '32px', height: '32px' }} src={`https://i.pravatar.cc/150?img=${i + 10}`} alt={`User ${i}`}>U</Avatar>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem' }}>
                          <span style={{ fontWeight: 500 }}>User {i}</span> completed a task
                        </p>
                        <p style={{ fontSize: '0.75rem', lineHeight: '1rem', color: 'var(--mat-sys-on-surface-variant)' }}>2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--mat-sys-outline-variant)' }}>
                  <h3 style={{ fontWeight: 600 }}>Quick Actions</h3>
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Button style={fullWidthStart} variant="outlined">
                    <MaterialIcon name="add" style={{ marginRight: '8px' }} />
                    Create New Project
                  </Button>
                  <Button style={fullWidthStart} variant="outlined">
                    <MaterialIcon name="group" style={{ marginRight: '8px' }} />
                    Invite Team Members
                  </Button>
                  <Button style={fullWidthStart} variant="outlined">
                    <MaterialIcon name="folder" style={{ marginRight: '8px' }} />
                    Browse Templates
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </Card>
  )
}
