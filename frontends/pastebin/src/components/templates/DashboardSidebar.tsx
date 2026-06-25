import { Button, MaterialIcon } from '@metabuilder/components/m3'
import styles from './DashboardTemplate.module.scss'

const fullWidthStart: React.CSSProperties = {
  width: '100%',
  justifyContent: 'flex-start',
}

const navItems = [
  { icon: 'home', label: 'Overview', variant: 'filled' as const },
  { icon: 'bar_chart', label: 'Analytics', variant: 'ghost' as const },
  { icon: 'folder', label: 'Projects', variant: 'ghost' as const },
  { icon: 'group', label: 'Team', variant: 'ghost' as const },
]

export function DashboardSidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ icon, label, variant }) => (
          <Button key={label} variant={variant} style={fullWidthStart}>
            <MaterialIcon name={icon} style={{ marginRight: '8px' }} />
            {label}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
