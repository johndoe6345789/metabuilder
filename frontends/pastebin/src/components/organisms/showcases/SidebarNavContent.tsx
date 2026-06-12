import { Button, Divider, MaterialIcon } from '@metabuilder/components/fakemui'

const fullWidthStart: React.CSSProperties = {
  width: '100%',
  justifyContent: 'flex-start',
}
const signOutStyle: React.CSSProperties = {
  ...fullWidthStart,
  color: 'var(--mat-sys-error)',
}
const navStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '4px',
}

const NAV_ITEMS = [
  { icon: 'home', label: 'Home', variant: 'ghost' as const },
  { icon: 'bar_chart', label: 'Analytics', variant: 'filled' as const },
  { icon: 'folder', label: 'Projects', variant: 'ghost' as const },
  { icon: 'person', label: 'Team', variant: 'ghost' as const },
]

export function SidebarNavContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <nav style={navStyle}>
        {NAV_ITEMS.map(({ icon, label, variant }) => (
          <Button key={label} variant={variant} style={fullWidthStart}>
            <MaterialIcon
              name={icon}
              style={{ marginRight: '8px' }}
              aria-hidden="true"
            />
            {label}
          </Button>
        ))}
      </nav>

      <Divider />

      <nav style={navStyle}>
        <Button variant="ghost" style={fullWidthStart}>
          <MaterialIcon
            name="settings"
            style={{ marginRight: '8px' }}
            aria-hidden="true"
          />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="text-destructive"
          style={signOutStyle}
        >
          <MaterialIcon
            name="logout"
            style={{ marginRight: '8px' }}
            aria-hidden="true"
          />
          Sign Out
        </Button>
      </nav>
    </div>
  )
}
