import { PlaywrightStep, PlaywrightTest } from '@/types/project'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Button, Input, Textarea } from '@metabuilder/fakemui/inputs'
import { Plus, Play } from '@metabuilder/fakemui/icons'
import copy from '@/data/playwright-designer.json'
import { StepEditor } from './StepEditor'

interface TestEditorProps {
  test: PlaywrightTest
  onAddStep: () => void
  onUpdateTest: (updates: Partial<PlaywrightTest>) => void
  onUpdateStep: (stepId: string, updates: Partial<PlaywrightStep>) => void
  onDeleteStep: (stepId: string) => void
}

export function TestEditor({
  test,
  onAddStep,
  onUpdateTest,
  onUpdateStep,
  onDeleteStep
}: TestEditorProps) {
  return (
    <div className="playwright-editor__content">
      <div className="playwright-editor__header">
        <h2 className="playwright-editor__title">{copy.headers.testConfiguration}</h2>
        <Button variant="outlined" startIcon={<Play size={16} weight="fill" />}>
          {copy.buttons.runTest}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{copy.headers.testDetails}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="playwright-editor__fields">
            <Input
              id="test-name"
              label={copy.fields.testName}
              fullWidth
              value={test.name}
              onChange={e => onUpdateTest({ name: e.target.value })}
            />
            <Textarea
              id="test-description"
              value={test.description}
              onChange={e => onUpdateTest({ description: e.target.value })}
              placeholder={copy.placeholders.description}
            />
            <Input
              id="test-url"
              label={copy.fields.pageUrl}
              fullWidth
              value={test.pageUrl}
              onChange={e => onUpdateTest({ pageUrl: e.target.value })}
              placeholder={copy.placeholders.pageUrl}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="playwright-editor__steps-header">
            <div>
              <CardTitle>{copy.headers.testSteps}</CardTitle>
              <CardDescription>{copy.descriptions.testSteps}</CardDescription>
            </div>
            <Button size="small" startIcon={<Plus size={14} />} onClick={onAddStep}>
              {copy.buttons.addStep}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="playwright-editor__scroll-area">
            <div className="playwright-editor__steps-list">
              {test.steps.map((step, index) => (
                <StepEditor
                  key={step.id}
                  step={step}
                  index={index}
                  onUpdate={onUpdateStep}
                  onDelete={onDeleteStep}
                />
              ))}
              {test.steps.length === 0 && (
                <p className="playwright-editor__no-steps">
                  {copy.emptyStates.noSteps}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
