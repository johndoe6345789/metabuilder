import { useState, useCallback } from 'react'
import { PlaywrightTest, PlaywrightStep } from '@/types/project'
import { toast } from '@/components/ui/sonner'
import { llm } from '@/lib/llm-service'
import copy from '@/data/playwright-designer.json'

interface UsePlaywrightDesignerReturn {
  selectedTestId: string | null
  setSelectedTestId: (id: string | null) => void
  selectedTest: PlaywrightTest | undefined
  tests: PlaywrightTest[]
  handleAddTest: () => void
  handleDeleteTest: (testId: string) => void
  handleUpdateTest: (testId: string, updates: Partial<PlaywrightTest>) => void
  handleUpdateTestPartial: (updates: Partial<PlaywrightTest>) => void
  handleAddStep: () => void
  handleUpdateStep: (stepId: string, updates: Partial<PlaywrightStep>) => void
  handleDeleteStep: (stepId: string) => void
  handleGenerateWithAI: () => void
  copy: typeof copy
}

export function usePlaywrightDesigner(
  tests: PlaywrightTest[],
  onTestsChange: (tests: PlaywrightTest[]) => void
): UsePlaywrightDesignerReturn {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(tests[0]?.id || null)
  const selectedTest = tests.find(t => t.id === selectedTestId)

  const handleAddTest = useCallback(() => {
    const newTest: PlaywrightTest = {
      id: `test-${Date.now()}`,
      name: copy.defaults.newTestName,
      description: '',
      pageUrl: '/',
      steps: []
    }
    onTestsChange([...tests, newTest])
    setSelectedTestId(newTest.id)
  }, [tests, onTestsChange])

  const handleDeleteTest = useCallback((testId: string) => {
    const remaining = tests.filter(test => test.id !== testId)
    onTestsChange(remaining)
    if (selectedTestId === testId) {
      setSelectedTestId(remaining[0]?.id || null)
    }
  }, [tests, onTestsChange, selectedTestId])

  const handleUpdateTest = useCallback((testId: string, updates: Partial<PlaywrightTest>) => {
    onTestsChange(tests.map(test => (test.id === testId ? { ...test, ...updates } : test)))
  }, [tests, onTestsChange])

  const handleUpdateTestPartial = useCallback((updates: Partial<PlaywrightTest>) => {
    if (!selectedTest) return
    onTestsChange(tests.map(test => (test.id === selectedTest.id ? { ...test, ...updates } : test)))
  }, [tests, onTestsChange, selectedTest])

  const handleAddStep = useCallback(() => {
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
  }, [selectedTest, handleUpdateTest])

  const handleUpdateStep = useCallback((stepId: string, updates: Partial<PlaywrightStep>) => {
    if (!selectedTest) return
    handleUpdateTest(selectedTest.id, {
      steps: selectedTest.steps.map(step => (step.id === stepId ? { ...step, ...updates } : step))
    })
  }, [selectedTest, handleUpdateTest])

  const handleDeleteStep = useCallback((stepId: string) => {
    if (!selectedTest) return
    handleUpdateTest(selectedTest.id, {
      steps: selectedTest.steps.filter(step => step.id !== stepId)
    })
  }, [selectedTest, handleUpdateTest])

  const handleGenerateWithAI = useCallback(async () => {
    const description = prompt(copy.prompts.describeTest)
    if (!description) return

    try {
      toast.info(copy.messages.generating)
      const promptText = copy.prompts.template.replace('{description}', description)
      const response = await llm(promptText, 'claude-sonnet', true)
      const parsed = JSON.parse(response)
      onTestsChange([...tests, parsed.test])
      setSelectedTestId(parsed.test.id)
      toast.success(copy.messages.generated)
    } catch (error) {
      console.error(error)
      toast.error(copy.messages.failed)
    }
  }, [tests, onTestsChange])

  return {
    selectedTestId,
    setSelectedTestId,
    selectedTest,
    tests,
    handleAddTest,
    handleDeleteTest,
    handleUpdateTest,
    handleUpdateTestPartial,
    handleAddStep,
    handleUpdateStep,
    handleDeleteStep,
    handleGenerateWithAI,
    copy,
  }
}
