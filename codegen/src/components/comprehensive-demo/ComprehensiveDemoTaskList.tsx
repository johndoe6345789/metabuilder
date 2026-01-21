import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { DataList, ActionButton, IconButton } from '@/components/atoms'
import { Trash, Plus } from '@phosphor-icons/react'
import { useSearch } from '@/hooks/data'
import { cn } from '@/lib/utils'
import strings from '@/data/comprehensive-demo.json'
import type { Todo } from './types'

interface ComprehensiveDemoTaskListProps {
  todos: Todo[]
  onAdd: () => void
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

const priorityLabels = strings.priorityLabels as Record<Todo['priority'], string>

const getPriorityColor = (priority: Todo['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500/10 text-red-600 border-red-500/20'
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
    case 'low':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  }
}

export function ComprehensiveDemoTaskList({
  todos,
  onAdd,
  onToggle,
  onDelete,
}: ComprehensiveDemoTaskListProps) {
  const { query, setQuery, filtered } = useSearch({
    items: todos,
    searchFields: ['text' as keyof Todo],
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{strings.taskCard.title}</CardTitle>
            <CardDescription>{strings.taskCard.description}</CardDescription>
          </div>
          <ActionButton
            icon={<Plus size={16} weight="bold" />}
            label={strings.taskCard.addTask}
            onClick={onAdd}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={strings.taskCard.searchPlaceholder}
        />

        <Separator />

        <DataList
          items={filtered}
          emptyMessage={
            query ? strings.taskCard.empty.noMatch : strings.taskCard.empty.noTasks
          }
          renderItem={(todo) => (
            <Card className="bg-card/50 backdrop-blur hover:bg-card transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => onToggle(todo.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'font-medium',
                        todo.completed && 'line-through text-muted-foreground'
                      )}
                    >
                      {todo.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                        {priorityLabels[todo.priority]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(todo.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <IconButton
                    icon={<Trash size={16} />}
                    onClick={() => onDelete(todo.id)}
                    variant="ghost"
                    title={strings.taskCard.deleteTitle}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        />
      </CardContent>
    </Card>
  )
}
