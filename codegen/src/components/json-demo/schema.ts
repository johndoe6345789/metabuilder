import demoConfig from '@/config/json-demo.json'
import { UIComponent } from '@/lib/json-ui/schema'

type TodoItem = {
  id: number
  text: string
  completed: boolean
}

type DemoCopy = {
  toastAdded: string
  toastDeleted: string
  deleteButtonLabel: string
}

const baseSchema = demoConfig.schema as UIComponent

const cloneSchema = () => JSON.parse(JSON.stringify(baseSchema)) as UIComponent

const findComponentById = (component: UIComponent, id: string): UIComponent | null => {
  if (component.id === id) {
    return component
  }

  if (!Array.isArray(component.children)) {
    return null
  }

  for (const child of component.children) {
    if (typeof child === 'object' && child && 'id' in child) {
      const match = findComponentById(child as UIComponent, id)
      if (match) {
        return match
      }
    }
  }

  return null
}

const buildTodoItem = (todo: TodoItem, copy: DemoCopy): UIComponent => ({
  id: `todo-${todo.id}`,
  type: 'div',
  className: 'flex items-center gap-2 p-3 rounded-lg border bg-card',
  children: [
    {
      id: `checkbox-${todo.id}`,
      type: 'Checkbox',
      props: {
        checked: todo.completed,
      },
      events: [
        {
          event: 'checkedChange',
          actions: [
            {
              id: 'toggle-todo',
              type: 'custom',
              params: { id: todo.id },
            },
          ],
        },
      ],
    },
    {
      id: `text-${todo.id}`,
      type: 'span',
      className: todo.completed
        ? 'flex-1 line-through text-muted-foreground'
        : 'flex-1',
      children: todo.text,
    },
    {
      id: `delete-${todo.id}`,
      type: 'Button',
      props: {
        variant: 'ghost',
        size: 'sm',
        children: copy.deleteButtonLabel,
      },
      events: [
        {
          event: 'click',
          actions: [
            {
              id: 'delete-todo',
              type: 'custom',
              params: { id: todo.id },
            },
          ],
        },
      ],
    },
  ],
})

export const demoCopy = demoConfig.copy as DemoCopy
export const demoInitialTodos = demoConfig.initialTodos as TodoItem[]

export const buildDemoPageSchema = (todos: TodoItem[], newTodo: string): UIComponent => {
  const schema = cloneSchema()
  const inputComponent = findComponentById(schema, 'todo-input')
  if (inputComponent?.props) {
    inputComponent.props.value = newTodo
  }

  const todoList = findComponentById(schema, 'todo-list')
  if (todoList) {
    todoList.children = todos.map((todo) => buildTodoItem(todo, demoCopy))
  }

  return schema
}
