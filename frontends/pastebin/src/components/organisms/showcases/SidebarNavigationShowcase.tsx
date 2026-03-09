import { Card, Button, Divider, MaterialIcon } from '@metabuilder/components/fakemui'

const fullWidthStart: React.CSSProperties = { width: '100%', justifyContent: 'flex-start' }

export function SidebarNavigationShowcase() {
  return (
    <section className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="sidebar-navigation-showcase" role="region" aria-label="Sidebar navigation showcase">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Sidebar Navigation</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Complete sidebar with nested navigation
        </p>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <div className="flex" style={{ display: 'flex' }}>
          <aside className="w-64 border-r" style={{ width: '256px', borderRight: '1px solid var(--mat-sys-outline-variant)', backgroundColor: 'color-mix(in srgb, var(--mat-sys-surface-container) 50%, transparent)', padding: '16px' }}>
            <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingInline: '8px' }}>
                <div style={{ height: '32px', width: '32px', borderRadius: '8px', backgroundColor: 'var(--mat-sys-secondary-container)' }} />
                <span style={{ fontWeight: 700 }}>Dashboard</span>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Button variant="ghost" style={fullWidthStart}>
                  <MaterialIcon name="home" style={{ marginRight: '8px' }} aria-hidden="true" />
                  Home
                </Button>
                <Button variant="filled" style={fullWidthStart}>
                  <MaterialIcon name="bar_chart" style={{ marginRight: '8px' }} aria-hidden="true" />
                  Analytics
                </Button>
                <Button variant="ghost" style={fullWidthStart}>
                  <MaterialIcon name="folder" style={{ marginRight: '8px' }} aria-hidden="true" />
                  Projects
                </Button>
                <Button variant="ghost" style={fullWidthStart}>
                  <MaterialIcon name="person" style={{ marginRight: '8px' }} aria-hidden="true" />
                  Team
                </Button>
              </nav>

              <Divider />

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Button variant="ghost" style={fullWidthStart}>
                  <MaterialIcon name="settings" style={{ marginRight: '8px' }} aria-hidden="true" />
                  Settings
                </Button>
                <Button variant="ghost" className="text-destructive" style={{ ...fullWidthStart, color: 'var(--mat-sys-error)' }}>
                  <MaterialIcon name="logout" style={{ marginRight: '8px' }} aria-hidden="true" />
                  Sign Out
                </Button>
              </nav>
            </div>
          </aside>

          <div style={{ flex: 1, padding: '24px' }}>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
              Sidebar with navigation items and user actions
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
