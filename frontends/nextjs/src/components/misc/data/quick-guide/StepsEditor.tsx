import { ArrowCounterClockwise, ListNumbers, Plus, Trash } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@/components/ui'

export interface GuideStep {
  id: string
  title: string
  description: string
  mediaUrl?: string
  duration?: string
}

interface StepsEditorProps {
  steps: GuideStep[]
  onChange?: (steps: GuideStep[]) => void
}

export function StepsEditor({ steps, onChange }: StepsEditorProps) {
  const [localSteps, setLocalSteps] = useState<GuideStep[]>(steps)

  useEffect(() => {
    setLocalSteps(steps)
  }, [steps])

  const updateStep = (id: string, payload: Partial<GuideStep>) => {
    const nextSteps = localSteps.map(step => (step.id === id ? { ...step, ...payload } : step))
    setLocalSteps(nextSteps)
    onChange?.(nextSteps)
  }

  const removeStep = (id: string) => {
    const nextSteps = localSteps.filter(step => step.id !== id)
    setLocalSteps(nextSteps)
    onChange?.(nextSteps)
  }

  const addStep = () => {
    const newStep: GuideStep = {
      id: crypto.randomUUID(),
      title: 'New step',
      description: 'Describe what happens in this step.',
      duration: '1-2 min',
    }

    const nextSteps = [...localSteps, newStep]
    setLocalSteps(nextSteps)
    onChange?.(nextSteps)
  }

  const resetOrdering = () => {
    const nextSteps = localSteps.map((step, index) => ({ ...step, id: `step_${index + 1}` }))
    setLocalSteps(nextSteps)
    onChange?.(nextSteps)
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ListNumbers size={20} weight="duotone" />
            Steps
          </CardTitle>
          <CardDescription>
            Keep your quick guide instructions concise and actionable.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={resetOrdering}>
            <ArrowCounterClockwise size={16} />
            Reset IDs
          </Button>
          <Button size="sm" onClick={addStep}>
            <Plus size={16} />
            Add Step
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {localSteps.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add your first step to get started.</p>
        ) : (
          <div className="space-y-4">
            {localSteps.map((step, index) => (
              <div
                key={step.id}
                className="rounded-lg border border-border/80 bg-card/60 p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">Step {index + 1}</Badge>
                    <span>Duration: {step.duration || 'n/a'}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeStep(step.id)}>
                    <Trash size={16} />
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${step.id}`}>Title</Label>
                    <Input
                      id={`title-${step.id}`}
                      value={step.title}
                      onChange={e => updateStep(step.id, { title: e.target.value })}
                      placeholder="Give this step a short name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`duration-${step.id}`}>Expected duration</Label>
                    <Input
                      id={`duration-${step.id}`}
                      value={step.duration || ''}
                      onChange={e => updateStep(step.id, { duration: e.target.value })}
                      placeholder="e.g. 30s, 1-2 min"
                    />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Label htmlFor={`description-${step.id}`}>Description</Label>
                  <Textarea
                    id={`description-${step.id}`}
                    value={step.description}
                    onChange={e => updateStep(step.id, { description: e.target.value })}
                    rows={3}
                    placeholder="Outline the actions or context for this step"
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <Label htmlFor={`media-${step.id}`}>Media URL (optional)</Label>
                  <Input
                    id={`media-${step.id}`}
                    value={step.mediaUrl || ''}
                    onChange={e => updateStep(step.id, { mediaUrl: e.target.value })}
                    placeholder="Link to an image, GIF, or short video"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
