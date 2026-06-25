import { Card, Avatar } from '@metabuilder/components/m3'

export function DashboardRecentActivity() {
  return (
    <Card>
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--mat-sys-outline-variant)',
        }}
      >
        <h3 style={{ fontWeight: 600 }}>Recent Activity</h3>
      </div>
      <div
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {[1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <Avatar
              style={{ width: '32px', height: '32px' }}
              src={`https://i.pravatar.cc/150?img=${i + 10}`}
              alt={`User ${i}`}
            >
              U
            </Avatar>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem',
                }}
              >
                <span style={{ fontWeight: 500 }}>User {i}</span>
                {' completed a task'}
              </p>
              <p
                style={{
                  fontSize: '0.75rem',
                  lineHeight: '1rem',
                  color: 'var(--mat-sys-on-surface-variant)',
                }}
              >
                2 hours ago
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
