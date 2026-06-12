import { Card } from '@metabuilder/components/fakemui'
import { SidebarNavContent } from './SidebarNavContent'

const sidebarStyle: React.CSSProperties = {
  width: '256px',
  borderRight: '1px solid var(--mat-sys-outline-variant)',
  backgroundColor:
    'color-mix(in srgb, var(--mat-sys-surface-container) 50%, transparent)',
  padding: '16px',
}
const logoBoxStyle: React.CSSProperties = {
  height: '32px',
  width: '32px',
  borderRadius: '8px',
  backgroundColor: 'var(--mat-sys-secondary-container)',
}
const subtextStyle = {
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  color: 'var(--mat-sys-on-surface-variant)',
}

export function SidebarNavigationShowcase() {
  return (
    <section
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      data-testid="sidebar-navigation-showcase"
      role="region"
      aria-label="Sidebar navigation showcase"
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
          Sidebar Navigation
        </h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Complete sidebar with nested navigation
        </p>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex' }}>
          <aside style={sidebarStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingInline: '8px',
                marginBottom: '24px',
              }}
            >
              <div style={logoBoxStyle} />
              <span style={{ fontWeight: 700 }}>Dashboard</span>
            </div>
            <SidebarNavContent />
          </aside>

          <div style={{ flex: 1, padding: '24px' }}>
            <p style={subtextStyle}>
              Sidebar with navigation items and user actions
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
