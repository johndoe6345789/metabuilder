import { useCRUD, useSearchFilter } from '@/hooks/data'
import { useToggle, useDialog } from '@/hooks/ui'
import { useKV } from '@/hooks/use-kv'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SearchInput } from '@/lib/json-ui/json-components'
import { DataCard } from '@/components/atoms/json-ui'
import { Heading, Badge } from '@/lib/json-ui/json-components'
import { Plus, Trash, Eye } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Task {
  id: number
  title: string
  status: 'active' | 'pending' | 'success'
  priority: 'high' | 'medium' | 'low'
}

export function AtomicComponentDemo() {
  const [tasks, setTasks] = useKV<Task[]>('demo-tasks', [
    { id: 1, title: 'Build component library', status: 'active', priority: 'high' },
    { id: 2, title: 'Write documentation', status: 'pending', priority: 'medium' },
    { id: 3, title: 'Create examples', status: 'success', priority: 'low' },
  ])

  const crud = useCRUD<Task>({ items: tasks, setItems: setTasks })

  const { searchQuery: query, setSearchQuery: setQuery, filtered } = useSearchFilter({
    items: tasks,
    searchFields: ['title'],
  })

  const showCompleted = useToggle({ initial: true })
  const addDialog = useDialog()

  const displayedTasks = showCompleted.value 
    ? filtered 
    : filtered.filter(t => t.status !== 'success')

  const handleAddTask = () => {
    crud.create({
      id: Date.now(),
      title: 'New Task',
      status: 'pending',
      priority: 'medium',
    })
    addDialog.close()
  }

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => t.status === 'active').length,
    completed: tasks.filter(t => t.status === 'success').length,
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div>
        <Heading level={1} className="mb-2">
          Atomic Component Demo
        </Heading>
        <p className="text-muted-foreground">
          Demonstrating custom hooks and atomic components
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <DataCard title="Total Tasks" icon="list" gradient="from-blue-500/10 to-blue-500/5">
          <div className="text-3xl font-bold">{stats.total}</div>
        </DataCard>
        <DataCard title="Active" icon="clock" gradient="from-amber-500/10 to-amber-500/5">
          <div className="text-3xl font-bold">{stats.active}</div>
        </DataCard>
        <DataCard title="Completed" icon="check" gradient="from-green-500/10 to-green-500/5">
          <div className="text-3xl font-bold">{stats.completed}</div>
        </DataCard>
      </div>

      {/* ActionBar replaced with inline buttons */}
      <div className="flex items-center justify-between">
        <Heading level={3}>Tasks</Heading>
        <div className="flex gap-2">
          <Button onClick={addDialog.open} size="sm">
            <Plus size={16} className="mr-2" />
            Add Task
          </Button>
          <Button onClick={showCompleted.toggle} variant="outline" size="sm">
            <Eye size={16} className="mr-2" />
            {showCompleted.value ? 'Hide Completed' : 'Show Completed'}
          </Button>
        </div>
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search tasks..."
      />

      <div className="space-y-3">
        {displayedTasks.map(task => (
          <Card key={task.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge>{task.status}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => crud.delete(task.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Priority: {task.priority}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {displayedTasks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No tasks found
          </CardContent>
        </Card>
      )}

      <Dialog open={addDialog.isOpen} onOpenChange={addDialog.setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={handleAddTask} className="w-full">
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
