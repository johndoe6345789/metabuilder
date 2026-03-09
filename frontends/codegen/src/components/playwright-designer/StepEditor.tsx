import { PlaywrightStep } from '@/types/project'
import { Card, CardContent } from '@metabuilder/fakemui/surfaces'
import { Button, Input } from '@metabuilder/fakemui/inputs'
import { Trash } from '@metabuilder/fakemui/icons'
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
      <CardContent>
        <div className="step-editor__header">
          <span className="step-editor__index-label">
            {copy.labels.stepPrefix} {index + 1}
          </span>
          <Button
            size="small"
            variant="text"
            startIcon={<Trash size={14} />}
            onClick={() => onDelete(step.id)}
          />
        </div>
        <div className="step-editor__fields">
          <div className="step-editor__field">
            <label className="step-editor__field-label">{copy.fields.action}</label>
            <select
              className="step-editor__select"
              value={step.action}
              onChange={e => onUpdate(step.id, { action: e.target.value as PlaywrightStep['action'] })}
            >
              {actionOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {showSelector && (
            <div className="step-editor__field">
              <Input
                label={copy.fields.selector}
                fullWidth
                value={step.selector || ''}
                onChange={e => onUpdate(step.id, { selector: e.target.value })}
                placeholder={copy.placeholders.selector}
              />
            </div>
          )}
          {showValue && (
            <div className="step-editor__field step-editor__field--full">
              <Input
                label={copy.fields.value}
                fullWidth
                value={step.value || ''}
                onChange={e => onUpdate(step.id, { value: e.target.value })}
                placeholder={copy.placeholders.value}
              />
            </div>
          )}
          {showAssertion && (
            <div className="step-editor__field step-editor__field--full">
              <Input
                label={copy.fields.assertion}
                fullWidth
                value={step.assertion || ''}
                onChange={e => onUpdate(step.id, { assertion: e.target.value })}
                placeholder={copy.placeholders.assertion}
              />
            </div>
          )}
          {showTimeout && (
            <div className="step-editor__field">
              <Input
                label={copy.fields.timeout}
                fullWidth
                type="number"
                value={String(step.timeout ?? 1000)}
                onChange={e => onUpdate(step.id, { timeout: Number.parseInt(e.target.value, 10) })}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
