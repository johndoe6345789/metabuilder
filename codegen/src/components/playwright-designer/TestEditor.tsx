import { PlaywrightStep, PlaywrightTest } from '@/types/project'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Play } from '@phosphor-icons/react'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{copy.headers.testConfiguration}</h2>
        <Button variant="outline">
          <Play size={16} className="mr-2" weight="fill" />
          {copy.buttons.runTest}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{copy.headers.testDetails}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-name">{copy.fields.testName}</Label>
            <Input
              id="test-name"
              value={test.name}
              onChange={e => onUpdateTest({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-description">{copy.fields.description}</Label>
            <Textarea
              id="test-description"
              value={test.description}
              onChange={e => onUpdateTest({ description: e.target.value })}
              placeholder={copy.placeholders.description}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-url">{copy.fields.pageUrl}</Label>
            <Input
              id="test-url"
              value={test.pageUrl}
              onChange={e => onUpdateTest({ pageUrl: e.target.value })}
              placeholder={copy.placeholders.pageUrl}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{copy.headers.testSteps}</CardTitle>
              <CardDescription>{copy.descriptions.testSteps}</CardDescription>
            </div>
            <Button size="sm" onClick={onAddStep}>
              <Plus size={14} className="mr-1" />
              {copy.buttons.addStep}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
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
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {copy.emptyStates.noSteps}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
