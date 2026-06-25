import { Card, Button, MaterialIcon } from '@metabuilder/components/m3'

const fullWidthStart: React.CSSProperties = {
  width: '100%',
  justifyContent: 'flex-start',
}

export function DashboardQuickActions() {
  return (
    <Card>
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--mat-sys-outline-variant)',
        }}
      >
        <h3 style={{ fontWeight: 600 }}>Quick Actions</h3>
      </div>
      <div
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
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
  )
}
