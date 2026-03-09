import { Button } from '@metabuilder/fakemui/inputs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@metabuilder/fakemui/surfaces'
import { Input } from '@metabuilder/fakemui/inputs'
import strings from '@/data/comprehensive-demo.json'
import type { Priority } from './types'

interface ComprehensiveDemoDialogsProps {
  isOpen: boolean
  newTodoText: string
  newTodoPriority: Priority
  onNewTodoTextChange: (value: string) => void
  onNewTodoPriorityChange: (value: Priority) => void
  onAdd: () => void
  onClose: () => void
}

const priorities: Priority[] = ['low', 'medium', 'high']

export function ComprehensiveDemoDialogs({
  isOpen,
  newTodoText,
  newTodoPriority,
  onNewTodoTextChange,
  onNewTodoPriorityChange,
  onAdd,
  onClose,
}: ComprehensiveDemoDialogsProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{strings.dialog.title}</CardTitle>
          <CardDescription>{strings.dialog.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <label>{strings.dialog.taskDescriptionLabel}</label>
            <Input
              value={newTodoText}
              onChange={(event) => onNewTodoTextChange(event.target.value)}
              placeholder={strings.dialog.taskDescriptionPlaceholder}
              onKeyDown={(event) => event.key === 'Enter' && onAdd()}
              autoFocus
            />
          </div>
          <div>
            <label>{strings.dialog.priorityLabel}</label>
            <div>
              {priorities.map((priority) => (
                <Button
                  key={priority}
                  variant={newTodoPriority === priority ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => onNewTodoPriorityChange(priority)}
                >
                  {strings.priorityLabels[priority]}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Button onClick={onAdd} disabled={!newTodoText.trim()}>
              {strings.dialog.addButton}
            </Button>
            <Button onClick={onClose} variant="outlined">
              {strings.dialog.cancelButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
