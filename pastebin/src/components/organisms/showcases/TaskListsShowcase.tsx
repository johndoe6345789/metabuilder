import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Clock,
  XCircle,
  Plus,
} from '@phosphor-icons/react'

export function TaskListsShowcase() {
  return (
    <section className="space-y-6" data-testid="task-lists-showcase" role="region" aria-label="Task lists showcase">
      <div>
        <h2 className="text-3xl font-bold mb-2">Task Lists</h2>
        <p className="text-muted-foreground">
          Interactive lists with status and actions
        </p>
      </div>

      <Card>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Project Tasks</h3>
            <Button size="sm">
              <Plus className="mr-2" aria-hidden="true" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="divide-y divide-border">
          <div className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
              <CheckCircle weight="fill" className="h-6 w-6 text-accent mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">Design system documentation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete the component library documentation
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="secondary">Design</Badge>
                  <span className="text-xs text-muted-foreground">Completed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
              <Clock weight="fill" className="h-6 w-6 text-accent mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">API integration</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect frontend to backend services
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge>Development</Badge>
                  <span className="text-xs text-muted-foreground">In Progress</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
              <XCircle weight="fill" className="h-6 w-6 text-destructive mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">Performance optimization</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Improve page load times and reduce bundle size
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="destructive">Blocked</Badge>
                  <span className="text-xs text-muted-foreground">Needs review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
