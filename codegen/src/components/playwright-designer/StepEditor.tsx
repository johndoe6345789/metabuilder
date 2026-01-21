import { PlaywrightStep } from '@/types/project'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash } from '@phosphor-icons/react'
import copy from '@/data/playwright-designer.json'

interface StepEditorProps {
  step: PlaywrightStep
  index: number
  onUpdate: (stepId: string, updates: Partial<PlaywrightStep>) => void
  onDelete: (stepId: string) => void
}

const actionOptions = Object.entries(copy.actions)

export function StepEditor({ step, index, onUpdate, onDelete }: StepEditorProps) {
  const showSelector = step.action !== 'navigate' && step.action !== 'wait'
  const showValue = step.action === 'fill' || step.action === 'select'
  const showAssertion = step.action === 'expect'
  const showTimeout = step.action === 'wait'

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">
            {copy.labels.stepPrefix} {index + 1}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(step.id)}
          >
            <Trash size={14} />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{copy.fields.action}</Label>
            <Select
              value={step.action}
              onValueChange={value => onUpdate(step.id, { action: value as PlaywrightStep['action'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showSelector && (
            <div className="space-y-2">
              <Label>{copy.fields.selector}</Label>
              <Input
                value={step.selector || ''}
                onChange={e => onUpdate(step.id, { selector: e.target.value })}
                placeholder={copy.placeholders.selector}
              />
            </div>
          )}
          {showValue && (
            <div className="space-y-2 col-span-2">
              <Label>{copy.fields.value}</Label>
              <Input
                value={step.value || ''}
                onChange={e => onUpdate(step.id, { value: e.target.value })}
                placeholder={copy.placeholders.value}
              />
            </div>
          )}
          {showAssertion && (
            <div className="space-y-2 col-span-2">
              <Label>{copy.fields.assertion}</Label>
              <Input
                value={step.assertion || ''}
                onChange={e => onUpdate(step.id, { assertion: e.target.value })}
                placeholder={copy.placeholders.assertion}
              />
            </div>
          )}
          {showTimeout && (
            <div className="space-y-2">
              <Label>{copy.fields.timeout}</Label>
              <Input
                type="number"
                value={step.timeout ?? 1000}
                onChange={e => onUpdate(step.id, { timeout: Number.parseInt(e.target.value, 10) })}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
