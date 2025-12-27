import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface StatsGridProps {
  stats: {
    total: number
    errors: number
    warnings: number
    info: number
    resolved: number
    unresolved: number
  }
}

const cardConfig = [
  { key: 'total', label: 'Total', color: 'text-white' },
  { key: 'errors', label: 'Errors', color: 'text-red-400' },
  { key: 'warnings', label: 'Warnings', color: 'text-yellow-400' },
  { key: 'info', label: 'Info', color: 'text-blue-400' },
  { key: 'resolved', label: 'Resolved', color: 'text-green-400' },
  { key: 'unresolved', label: 'Unresolved', color: 'text-orange-400' },
] as const

export const StatsGrid = ({ stats }: StatsGridProps) => (
  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
    {cardConfig.map(({ key, label, color }) => (
      <Card key={key} className="bg-black/40 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${color}`}>{stats[key]}</div>
        </CardContent>
      </Card>
    ))}
  </div>
)
