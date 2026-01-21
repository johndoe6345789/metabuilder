import { JSONUIRenderer } from '@/lib/json-ui'
import { toast } from 'sonner'
import { useKV } from '@/hooks/use-kv'
import { useState } from 'react'
import { buildDemoPageSchema, demoCopy, demoInitialTodos } from '@/components/json-demo/schema'
import { Action } from '@/lib/json-ui/schema'

export function JSONDemoPage() {
  const [todos, setTodos] = useKV('json-demo-todos', demoInitialTodos)
  const [newTodo, setNewTodo] = useState('')

  const handleAction = (actions: Action[], event?: any) => {
    actions.forEach((action) => {
      const actionKey = action.type === 'custom' ? action.id : action.type

      switch (actionKey) {
        case 'add-todo':
          if (newTodo.trim()) {
            setTodos((current: any) => [
              ...current,
              { id: Date.now(), text: newTodo, completed: false },
            ])
            setNewTodo('')
            toast.success(demoCopy.toastAdded)
          }
          break

        case 'toggle-todo':
          setTodos((current: any) =>
            current.map((todo: any) =>
              todo.id === action.params?.id
                ? { ...todo, completed: !todo.completed }
                : todo
            )
          )
          break

        case 'delete-todo':
          setTodos((current: any) =>
            current.filter((todo: any) => todo.id !== action.params?.id)
          )
          toast.success(demoCopy.toastDeleted)
          break

        case 'update-input':
          setNewTodo(event.target.value)
          break
      }
    })
  }

  const pageSchema = buildDemoPageSchema(todos, newTodo)

  return (
    <JSONUIRenderer
      component={pageSchema}
      dataMap={{ todos, newTodo }}
      onAction={handleAction}
    />
  )
}
