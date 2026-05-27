import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@metabuilder/fakemui/surfaces'
import { Button } from '@metabuilder/fakemui/inputs'
import { Input } from '@metabuilder/fakemui/inputs'
import copy from '@/data/storage-example.json'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

export function TodoListCard({
  todos,
  newTodoText,
  onTodoTextChange,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}: {
  todos: Todo[]
  newTodoText: string
  onTodoTextChange: (v: string) => void
  onAddTodo: () => void
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.todo.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Input
            value={newTodoText}
            onChange={(e) =>
              onTodoTextChange(e.target.value)
            }
            placeholder={copy.todo.placeholder}
            onKeyDown={(e) =>
              e.key === 'Enter' && onAddTodo()
            }
          />
          <Button onClick={onAddTodo}>
            {copy.todo.addButton}
          </Button>
        </div>
        <div>
          {todos.length === 0 ? (
            <p>{copy.todo.emptyState}</p>
          ) : (
            todos.map((todo) => (
              <div key={todo.id}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() =>
                    onToggleTodo(todo.id)
                  }
                />
                <span
                  style={{
                    textDecoration: todo.completed
                      ? 'line-through'
                      : 'none',
                  }}
                >
                  {todo.text}
                </span>
                <Button
                  variant="text"
                  size="small"
                  onClick={() =>
                    onDeleteTodo(todo.id)
                  }
                >
                  {copy.todo.deleteButton}
                </Button>
              </div>
            ))
          )}
        </div>
        <p>{copy.todo.footer}</p>
      </CardContent>
    </Card>
  )
}
