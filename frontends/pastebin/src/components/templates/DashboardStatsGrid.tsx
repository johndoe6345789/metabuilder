import { Card, MaterialIcon } from '@metabuilder/components/m3'

interface StatCardProps {
  label: string
  value: string
  trend: string
}

function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <Card style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '0.875rem',
              lineHeight: '1.25rem',
              color: 'var(--mat-sys-on-surface-variant)',
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: '1.875rem',
              lineHeight: '2.25rem',
              fontWeight: 700,
              marginTop: '8px',
            }}
          >
            {value}
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              lineHeight: '1.25rem',
              color: 'var(--mat-sys-secondary-container)',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <MaterialIcon name="trending_up" size={16} />
            {trend}
          </p>
        </div>
      </div>
    </Card>
  )
}

const STATS = [
  {
    label: 'Total Revenue',
    value: '$45,231',
    trend: '+20.1% from last month',
  },
  {
    label: 'Active Users',
    value: '2,350',
    trend: '+12.5% from last month',
  },
  {
    label: 'Total Orders',
    value: '1,234',
    trend: '+8.2% from last month',
  },
]

interface DashboardStatsGridProps {
  className: string
}

export function DashboardStatsGrid({ className }: DashboardStatsGridProps) {
  return (
    <div className={className}>
      {STATS.map(s => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  )
}
