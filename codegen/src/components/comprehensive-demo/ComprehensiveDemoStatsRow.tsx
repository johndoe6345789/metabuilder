import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Check, Clock } from '@phosphor-icons/react'
import strings from '@/data/comprehensive-demo.json'
import type { Todo } from './types'

interface ComprehensiveDemoStatsRowProps {
  todos: Todo[]
}

export function ComprehensiveDemoStatsRow({ todos }: ComprehensiveDemoStatsRowProps) {
  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter((todo) => todo.completed).length
    const pending = total - completed
    const completionRate = total > 0 ? (completed / total) * 100 : 0

    return { total, completed, pending, completionRate }
  }, [todos])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-card/50 backdrop-blur">
        <CardContent className="pt-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{strings.stats.total}</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-500/5 backdrop-blur border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{strings.stats.completed}</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <Check className="text-green-600" size={24} weight="duotone" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-500/5 backdrop-blur border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{strings.stats.pending}</p>
              <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
            </div>
            <Clock className="text-blue-600" size={24} weight="duotone" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 backdrop-blur border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{strings.stats.completion}</p>
            <p className="text-3xl font-bold text-primary">{Math.round(stats.completionRate)}%</p>
            <Progress value={stats.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
