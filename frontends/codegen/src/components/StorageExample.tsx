import { Database } from '@metabuilder/fakemui/icons'
import copy from '@/data/storage-example.json'
import { useStorageExample } from './storage/useStorageExample'
import { CounterCard } from './storage-example/CounterCard'
import { TodoListCard } from './storage-example/TodoListCard'
import { HowItWorksCard } from './storage-example/HowItWorksCard'

export function StorageExample() {
  const {
    todos,
    counter,
    newTodoText,
    setNewTodoText,
    addTodo,
    toggleTodo,
    deleteTodo,
    incrementCounter,
  } = useStorageExample()

  return (
    <div>
      <div>
        <h1>
          <Database size={32} />
          {copy.title}
        </h1>
        <p>{copy.description}</p>
      </div>
      <div>
        <CounterCard
          counter={counter}
          onIncrement={incrementCounter}
        />
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
