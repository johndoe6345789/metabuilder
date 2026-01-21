/// <reference path="../global.d.ts" />

import { useState } from 'react'
import { PlaywrightTest, PlaywrightStep } from '@/types/project'
import { Button } from '@/components/ui/button'
import { Play, Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import copy from '@/data/playwright-designer.json'
import { TestList } from '@/components/playwright-designer/TestList'
import { TestEditor } from '@/components/playwright-designer/TestEditor'

interface PlaywrightDesignerProps {
  tests: PlaywrightTest[]
  onTestsChange: (tests: PlaywrightTest[]) => void
}

export function PlaywrightDesigner({ tests, onTestsChange }: PlaywrightDesignerProps) {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(tests[0]?.id || null)
  const selectedTest = tests.find(t => t.id === selectedTestId)

  const handleAddTest = () => {
    const newTest: PlaywrightTest = {
      id: `test-${Date.now()}`,
      name: copy.defaults.newTestName,
      description: '',
      pageUrl: '/',
      steps: []
    }
    onTestsChange([...tests, newTest])
    setSelectedTestId(newTest.id)
  }

  const handleDeleteTest = (testId: string) => {
    const remaining = tests.filter(test => test.id !== testId)
    onTestsChange(remaining)
    if (selectedTestId === testId) {
      setSelectedTestId(remaining[0]?.id || null)
    }
  }

  const handleUpdateTest = (testId: string, updates: Partial<PlaywrightTest>) => {
    onTestsChange(tests.map(test => (test.id === testId ? { ...test, ...updates } : test)))
  }

  const handleAddStep = () => {
    if (!selectedTest) return
    const newStep: PlaywrightStep = {
      id: `step-${Date.now()}`,
      action: 'click',
      selector: '',
      value: ''
    }
    handleUpdateTest(selectedTest.id, {
      steps: [...selectedTest.steps, newStep]
    })
  }

  const handleUpdateStep = (stepId: string, updates: Partial<PlaywrightStep>) => {
    if (!selectedTest) return
    handleUpdateTest(selectedTest.id, {
      steps: selectedTest.steps.map(step => (step.id === stepId ? { ...step, ...updates } : step))
    })
  }

  const handleDeleteStep = (stepId: string) => {
    if (!selectedTest) return
    handleUpdateTest(selectedTest.id, {
      steps: selectedTest.steps.filter(step => step.id !== stepId)
    })
  }

  const handleGenerateWithAI = async () => {
    const description = prompt(copy.prompts.describeTest)
    if (!description) return

    try {
      toast.info(copy.messages.generating)
      const promptText = copy.prompts.template.replace('{description}', description)
      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const parsed = JSON.parse(response)
      onTestsChange([...tests, parsed.test])
      setSelectedTestId(parsed.test.id)
      toast.success(copy.messages.generated)
    } catch (error) {
      console.error(error)
      toast.error(copy.messages.failed)
    }
  }

  return (
    <div className="h-full flex">
      <TestList
        tests={tests}
        selectedTestId={selectedTestId}
        onSelect={setSelectedTestId}
        onAddTest={handleAddTest}
        onDeleteTest={handleDeleteTest}
        onGenerateWithAI={handleGenerateWithAI}
      />

      <div className="flex-1 p-6">
        {selectedTest ? (
          <TestEditor
            test={selectedTest}
            onAddStep={handleAddStep}
            onUpdateTest={updates => handleUpdateTest(selectedTest.id, updates)}
            onUpdateStep={handleUpdateStep}
            onDeleteStep={handleDeleteStep}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Play size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">{copy.emptyStates.noTestSelectedTitle}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {copy.emptyStates.noTestSelectedBody}
              </p>
              <Button onClick={handleAddTest}>
                <Plus size={16} className="mr-2" />
                {copy.buttons.createTest}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
