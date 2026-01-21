import { useStorage } from '@/hooks/use-storage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { Database } from '@phosphor-icons/react'
import copy from '@/data/storage-example.json'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

type HeaderProps = {
  title: string
  description: string
}

const StorageExampleHeader = ({ title, description }: HeaderProps) => (
  <div>
    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
      <Database size={32} />
      {title}
    </h1>
    <p className="text-muted-foreground">{description}</p>
  </div>
)

type CounterCardProps = {
  counter: number
  onIncrement: () => void
}

const CounterCard = ({ counter, onIncrement }: CounterCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{copy.counter.title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <Badge variant="outline" className="text-4xl py-4 px-8">
          {counter}
        </Badge>
      </div>
      <Button onClick={onIncrement} className="w-full" size="lg">
        {copy.counter.incrementButton}
      </Button>
      <p className="text-xs text-muted-foreground text-center">{copy.counter.helper}</p>
    </CardContent>
  </Card>
)

type TodoListCardProps = {
  todos: Todo[]
  newTodoText: string
  onTodoTextChange: (value: string) => void
  onAddTodo: () => void
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string) => void
}

const TodoListCard = ({
  todos,
  newTodoText,
  onTodoTextChange,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}: TodoListCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{copy.todo.title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newTodoText}
          onChange={(e) => onTodoTextChange(e.target.value)}
          placeholder={copy.todo.placeholder}
          onKeyDown={(e) => e.key === 'Enter' && onAddTodo()}
        />
        <Button onClick={onAddTodo}>{copy.todo.addButton}</Button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {todos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {copy.todo.emptyState}
          </p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className="flex items-center gap-2 p-2 rounded border">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggleTodo(todo.id)}
                className="w-4 h-4"
              />
              <span
                className={`flex-1 ${
                  todo.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {todo.text}
              </span>
              <Button variant="ghost" size="sm" onClick={() => onDeleteTodo(todo.id)}>
                {copy.todo.deleteButton}
              </Button>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-muted-foreground">{copy.todo.footer}</p>
    </CardContent>
  </Card>
)

const HowItWorksCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>{copy.howItWorks.title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {copy.howItWorks.steps.map((step) => (
          <div className="space-y-2" key={step.title}>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-semibold mb-2">{copy.howItWorks.codeExampleTitle}</h4>
        <pre className="text-xs overflow-x-auto">{copy.howItWorks.codeSample}</pre>
      </div>
    </CardContent>
  </Card>
)

export function StorageExample() {
  const [newTodoText, setNewTodoText] = useState('')

  const [todos, setTodos] = useStorage<Todo[]>('example-todos', [])
  const [counter, setCounter] = useStorage<number>('example-counter', 0)

  const addTodo = () => {
    if (!newTodoText.trim()) return

    setTodos((current) => [
      ...current,
      {
        id: Date.now().toString(),
        text: newTodoText,
        completed: false,
        createdAt: Date.now(),
      },
    ])
    setNewTodoText('')
  }

  const toggleTodo = (id: string) => {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    )
  }

  const deleteTodo = (id: string) => {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  const incrementCounter = () => {
    setCounter((current) => current + 1)
  }

  return (
    <div className="space-y-6 p-6">
      <StorageExampleHeader title={copy.title} description={copy.description} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CounterCard counter={counter} onIncrement={incrementCounter} />
        <TodoListCard
          todos={todos}
          newTodoText={newTodoText}
          onTodoTextChange={setNewTodoText}
          onAddTodo={addTodo}
          onToggleTodo={toggleTodo}
          onDeleteTodo={deleteTodo}
        />
      </div>

      <HowItWorksCard />
    </div>
  )
}
