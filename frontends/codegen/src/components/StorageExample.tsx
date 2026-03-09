import { useStorage } from '@/hooks/use-storage'
import { Card, CardContent, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Button } from '@metabuilder/fakemui/inputs'
import { Input } from '@metabuilder/fakemui/inputs'
import { Badge } from '@metabuilder/fakemui/data-display'
import { useState } from 'react'
import { Database } from '@metabuilder/fakemui/icons'
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
    <h1>
      <Database size={32} />
      {title}
    </h1>
    <p>{description}</p>
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
    <CardContent>
      <div>
        <Badge variant="outline">
          {counter}
        </Badge>
      </div>
      <Button onClick={onIncrement} size="large">
        {copy.counter.incrementButton}
      </Button>
      <p>{copy.counter.helper}</p>
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
    <CardContent>
      <div>
        <Input
          value={newTodoText}
          onChange={(e) => onTodoTextChange(e.target.value)}
          placeholder={copy.todo.placeholder}
          onKeyDown={(e) => e.key === 'Enter' && onAddTodo()}
        />
        <Button onClick={onAddTodo}>{copy.todo.addButton}</Button>
      </div>

      <div>
        {todos.length === 0 ? (
          <p>
            {copy.todo.emptyState}
          </p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggleTodo(todo.id)}
              />
              <span
                style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              >
                {todo.text}
              </span>
              <Button variant="text" size="small" onClick={() => onDeleteTodo(todo.id)}>
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

const HowItWorksCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>{copy.howItWorks.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div>
        {copy.howItWorks.steps.map((step) => (
          <div key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>

      <div>
        <h4>{copy.howItWorks.codeExampleTitle}</h4>
        <pre>{copy.howItWorks.codeSample}</pre>
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
    <div>
      <StorageExampleHeader title={copy.title} description={copy.description} />

      <div>
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
