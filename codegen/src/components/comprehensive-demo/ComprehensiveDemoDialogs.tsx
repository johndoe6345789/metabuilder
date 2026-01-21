import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{strings.dialog.title}</CardTitle>
          <CardDescription>{strings.dialog.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{strings.dialog.taskDescriptionLabel}</label>
            <Input
              value={newTodoText}
              onChange={(event) => onNewTodoTextChange(event.target.value)}
              placeholder={strings.dialog.taskDescriptionPlaceholder}
              onKeyDown={(event) => event.key === 'Enter' && onAdd()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{strings.dialog.priorityLabel}</label>
            <div className="flex gap-2">
              {priorities.map((priority) => (
                <Button
                  key={priority}
                  variant={newTodoPriority === priority ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onNewTodoPriorityChange(priority)}
                  className="flex-1"
                >
                  {strings.priorityLabels[priority]}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={onAdd} className="flex-1" disabled={!newTodoText.trim()}>
              {strings.dialog.addButton}
            </Button>
            <Button onClick={onClose} variant="outline">
              {strings.dialog.cancelButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
