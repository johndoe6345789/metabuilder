import { Button, Avatar, MaterialIcon } from '@metabuilder/components/fakemui'

export function DashboardHeader() {
  return (
    <div style={{
      borderBottom: '1px solid var(--mat-sys-outline-variant)',
      backgroundColor: 'var(--mat-sys-surface-container)',
      padding: '16px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h3 style={{
          fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700,
        }}>
          Dashboard
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="ghost">
            <MaterialIcon name="notifications" />
          </Button>
          <Button variant="ghost">
            <MaterialIcon name="settings" />
          </Button>
          <Avatar
            style={{ width: '32px', height: '32px' }}
            src="https://i.pravatar.cc/150?img=4"
            alt="User"
          >U</Avatar>
        </div>
      </div>
    </div>
  )
}
