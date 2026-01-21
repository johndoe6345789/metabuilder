import { useState } from 'react'
import { useCRUD } from '@/hooks/data'
import { useDialog } from '@/hooks/ui'
import { useKV } from '@/hooks/use-kv'
import { toast } from 'sonner'
import strings from '@/data/comprehensive-demo.json'
import { ComprehensiveDemoHeader } from '@/components/comprehensive-demo/ComprehensiveDemoHeader'
import { ComprehensiveDemoStatsRow } from '@/components/comprehensive-demo/ComprehensiveDemoStatsRow'
import { ComprehensiveDemoTaskList } from '@/components/comprehensive-demo/ComprehensiveDemoTaskList'
import { ComprehensiveDemoArchitectureHighlights } from '@/components/comprehensive-demo/ComprehensiveDemoArchitectureHighlights'
import { ComprehensiveDemoDialogs } from '@/components/comprehensive-demo/ComprehensiveDemoDialogs'
import type { Priority, Todo } from '@/components/comprehensive-demo/types'

export function ComprehensiveDemoPage() {
  const [todos, setTodos] = useKV<Todo[]>('json-demo-todos', [])
  
  const crud = useCRUD<Todo>({
    items: todos,
    setItems: (updater) => setTodos(updater),
  })

  const newTodoDialog = useDialog()
  const [newTodoText, setNewTodoText] = useState('')
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>('medium')

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      crud.create({
        id: Date.now(),
        text: newTodoText,
        completed: false,
        priority: newTodoPriority,
        createdAt: new Date().toISOString(),
      })
      setNewTodoText('')
      setNewTodoPriority('medium')
      newTodoDialog.close()
      toast.success(strings.toast.added)
    }
  }

  const handleToggleTodo = (id: number) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      crud.update(id, { completed: !todo.completed })
      toast.success(todo.completed ? strings.toast.pending : strings.toast.completed)
    }
  }

  const handleDeleteTodo = (id: number) => {
    crud.delete(id)
    toast.success(strings.toast.deleted)
  }

  return (
    <div className="h-full overflow-auto p-6 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-5xl mx-auto space-y-6">
        <ComprehensiveDemoHeader />
        <ComprehensiveDemoStatsRow todos={todos} />
        <ComprehensiveDemoTaskList
          todos={todos}
          onAdd={newTodoDialog.open}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
        />
        <ComprehensiveDemoArchitectureHighlights />
      </div>

      <ComprehensiveDemoDialogs
        isOpen={newTodoDialog.isOpen}
        newTodoText={newTodoText}
        newTodoPriority={newTodoPriority}
        onNewTodoTextChange={setNewTodoText}
        onNewTodoPriorityChange={setNewTodoPriority}
        onAdd={handleAddTodo}
        onClose={newTodoDialog.close}
      />
    </div>
  )
}
