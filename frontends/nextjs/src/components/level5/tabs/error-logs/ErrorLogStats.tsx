import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { ErrorLogStats } from './useErrorLogs'

const STAT_CONFIG: Array<{ key: keyof ErrorLogStats; label: string; color: string }> = [
  { key: 'total', label: 'Total', color: 'text-white' },
  { key: 'errors', label: 'Errors', color: 'text-red-400' },
  { key: 'warnings', label: 'Warnings', color: 'text-yellow-400' },
  { key: 'info', label: 'Info', color: 'text-blue-400' },
  { key: 'resolved', label: 'Resolved', color: 'text-green-400' },
  { key: 'unresolved', label: 'Unresolved', color: 'text-orange-400' },
]

export function ErrorLogStats({ stats }: { stats: ErrorLogStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {STAT_CONFIG.map(({ key, label, color }) => (
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
}
