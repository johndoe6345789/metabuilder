import { Card, Button, Chip, MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './TaskListsShowcase.module.scss'

const onSurfaceVariant = 'var(--mat-sys-on-surface-variant)'
const secondaryContainer = 'var(--mat-sys-secondary-container)'

interface Task {
  icon: string
  iconColor: string
  title: string
  description: string
  chips: { label: string; color?: string }[]
  status: string
}

const TASKS: Task[] = [
  {
    icon: 'check_circle',
    iconColor: secondaryContainer,
    title: 'Design system documentation',
    description: 'Complete the component library documentation',
    chips: [{ label: 'Design', color: 'secondary' }],
    status: 'Completed',
  },
  {
    icon: 'schedule',
    iconColor: secondaryContainer,
    title: 'API integration',
    description: 'Connect frontend to backend services',
    chips: [{ label: 'Development' }],
    status: 'In Progress',
  },
  {
    icon: 'cancel',
    iconColor: 'var(--mat-sys-error)',
    title: 'Performance optimization',
    description: 'Improve page load times and reduce bundle size',
    chips: [{ label: 'Blocked', color: 'error' }],
    status: 'Needs review',
  },
]

function TaskItem({ task }: { task: Task }) {
  return (
    <div className={`${styles.taskItem} hover:bg-muted`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <MaterialIcon
          name={task.icon}
          size={24}
          style={{ color: task.iconColor, marginTop: '2px' }}
          aria-hidden="true"
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontWeight: 500 }}>{task.title}</h4>
          <p style={{
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            color: onSurfaceVariant,
            marginTop: '4px',
          }}>
            {task.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
            {task.chips.map((chip) => (
              <Chip key={chip.label} color={chip.color as any}>
                {chip.label}
              </Chip>
            ))}
            <span style={{
              fontSize: '0.75rem',
              lineHeight: '1rem',
              color: onSurfaceVariant,
            }}>
              {task.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TaskListsShowcase() {
  return (
    <section
      className="space-y-6"
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      data-testid="task-lists-showcase"
      role="region"
      aria-label="Task lists showcase"
    >
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>
          Task Lists
        </h2>
        <p style={{ color: onSurfaceVariant }}>
          Interactive lists with status and actions
        </p>
      </div>

      <Card>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--mat-sys-outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontWeight: 600, fontSize: '1.125rem', lineHeight: '1.75rem' }}>
              Project Tasks
            </h3>
            <Button size="sm">
              <MaterialIcon
                name="add"
                style={{ marginRight: '8px' }}
                aria-hidden="true"
              />
              Add Task
            </Button>
          </div>
        </div>

        <div className="divide-y">
          {TASKS.map((task) => (
            <TaskItem key={task.title} task={task} />
          ))}
        </div>
      </Card>
    </section>
  )
}
