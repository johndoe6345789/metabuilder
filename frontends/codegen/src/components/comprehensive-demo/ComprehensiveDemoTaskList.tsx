import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@metabuilder/fakemui/surfaces'
import { Checkbox, Input } from '@metabuilder/fakemui/inputs'
import { Badge, Separator } from '@metabuilder/fakemui/data-display'
import { DataList, ActionButton, IconButton } from '@/components/atoms'
import { Trash, Plus } from '@metabuilder/fakemui/icons'
import { useSearch } from '@/hooks/data'
import strings from '@/data/comprehensive-demo.json'
import type { Todo } from './types'

interface ComprehensiveDemoTaskListProps {
  todos: Todo[]
  onAdd: () => void
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

const priorityLabels = strings.priorityLabels as Record<Todo['priority'], string>

export function ComprehensiveDemoTaskList({
  todos,
  onAdd,
  onToggle,
  onDelete,
}: ComprehensiveDemoTaskListProps) {
  const { query, setQuery, results: filtered } = useSearch(todos, (todo, q) =>
    todo.text.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div>
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
      <CardContent>
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
            <Card>
              <CardContent>
                <div>
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => onToggle(todo.id)}
                  />
                  <div>
                    <p>
                      {todo.text}
                    </p>
                    <div>
                      <Badge variant="outlined">
                        {priorityLabels[todo.priority]}
                      </Badge>
                      <span>
                        {new Date(todo.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <IconButton
                    icon={<Trash size={16} />}
                    onClick={() => onDelete(todo.id)}
                    variant="text"
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
