import { useCRUD, useSearchFilter } from '@/hooks/data'
import { useToggle, useDialog } from '@/hooks/ui'
import { useUIState } from '@/hooks/use-ui-state'
import { Button } from '@metabuilder/fakemui/inputs'
import { Card, CardHeader, CardTitle, CardContent } from '@metabuilder/fakemui/surfaces'
import { MetabuilderWidgetSearchInput as SearchInput } from '@/lib/json-ui/json-components'
import { MetabuilderLayoutDataCard as DataCard } from '@/lib/json-ui/json-components'
import { MetabuilderDisplayHeading as Heading, MetabuilderDisplayBadge as Badge } from '@/lib/json-ui/json-components'
import { Plus, Trash, Eye } from '@metabuilder/fakemui/icons'
import { Dialog } from '@metabuilder/fakemui/feedback'
import { DialogContent, DialogHeader, DialogTitle } from '@metabuilder/fakemui/utils'

interface Task {
  id: number
  title: string
  status: 'active' | 'pending' | 'success'
  priority: 'high' | 'medium' | 'low'
}

export function AtomicComponentDemo() {
  const [tasks, setTasks] = useUIState<Task[]>('demo-tasks', [
    { id: 1, title: 'Build component library', status: 'active', priority: 'high' },
    { id: 2, title: 'Write documentation', status: 'pending', priority: 'medium' },
    { id: 3, title: 'Create examples', status: 'success', priority: 'low' },
  ])

  const crud = useCRUD<Task>({ items: tasks, setItems: setTasks })

  const { searchQuery: query, setSearchQuery: setQuery, filtered } = useSearchFilter({
    items: tasks,
    searchFields: ['title'],
  })

  const showCompleted = useToggle(true)
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
    <div>
      <div>
        <Heading level={1}>
          Atomic Component Demo
        </Heading>
        <p>
          Demonstrating custom hooks and atomic components
        </p>
      </div>

      <div>
        <DataCard title="Total Tasks" icon="list" gradient="from-blue-500/10 to-blue-500/5">
          <div>{stats.total}</div>
        </DataCard>
        <DataCard title="Active" icon="clock" gradient="from-amber-500/10 to-amber-500/5">
          <div>{stats.active}</div>
        </DataCard>
        <DataCard title="Completed" icon="check" gradient="from-green-500/10 to-green-500/5">
          <div>{stats.completed}</div>
        </DataCard>
      </div>

      <div>
        <Heading level={3}>Tasks</Heading>
        <div>
          <Button onClick={addDialog.open} size="small">
            <Plus size={16} />
            Add Task
          </Button>
          <Button onClick={showCompleted.toggle} variant="outlined" size="small">
            <Eye size={16} />
            {showCompleted.value ? 'Hide Completed' : 'Show Completed'}
          </Button>
        </div>
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search tasks..."
      />

      <div>
        {displayedTasks.map(task => (
          <Card key={task.id}>
            <CardHeader>
              <div>
                <CardTitle>{task.title}</CardTitle>
                <div>
                  <Badge>{task.status}</Badge>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => crud.delete(task.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                Priority: {task.priority}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {displayedTasks.length === 0 && (
        <Card>
          <CardContent>
            No tasks found
          </CardContent>
        </Card>
      )}

      <Dialog open={addDialog.isOpen} onClose={addDialog.close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div>
            <Button onClick={handleAddTask}>
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
