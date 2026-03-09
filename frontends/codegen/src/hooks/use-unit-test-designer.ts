import { useState } from 'react'
import { UnitTest, TestCase } from '@/types/project'
import { toast } from '@/components/ui/sonner'
import { llm } from '@/lib/llm-service'
import unitTestDesignerCopy from '@/data/unit-test-designer.json'

interface UseUnitTestDesignerArgs {
  tests: UnitTest[]
  onTestsChange: (tests: UnitTest[]) => void
}

export function useUnitTestDesigner({ tests, onTestsChange }: UseUnitTestDesignerArgs) {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(tests[0]?.id || null)
  const selectedTest = tests.find(t => t.id === selectedTestId)

  const handleAddTest = () => {
    const newTest: UnitTest = {
      id: `unit-test-${Date.now()}`,
      name: unitTestDesignerCopy.defaults.testSuiteName,
      description: '',
      testType: 'component',
      targetFile: '',
      testCases: []
    }
    onTestsChange([...tests, newTest])
    setSelectedTestId(newTest.id)
  }

  const handleDeleteTest = (testId: string) => {
    onTestsChange(tests.filter(t => t.id !== testId))
    if (selectedTestId === testId) {
      const remaining = tests.filter(t => t.id !== testId)
      setSelectedTestId(remaining[0]?.id || null)
    }
  }

  const handleUpdateTest = (testId: string, updates: Partial<UnitTest>) => {
    onTestsChange(
      tests.map(t => t.id === testId ? { ...t, ...updates } : t)
    )
  }

  const handleAddTestCase = () => {
    if (!selectedTest) return
    const newCase: TestCase = {
      id: `case-${Date.now()}`,
      description: unitTestDesignerCopy.defaults.testCaseDescription,
      assertions: [unitTestDesignerCopy.defaults.assertion],
      setup: '',
      teardown: ''
    }
    handleUpdateTest(selectedTest.id, {
      testCases: [...selectedTest.testCases, newCase]
    })
  }

  const handleUpdateTestCase = (caseId: string, updates: Partial<TestCase>) => {
    if (!selectedTest) return
    handleUpdateTest(selectedTest.id, {
      testCases: selectedTest.testCases.map(c => c.id === caseId ? { ...c, ...updates } : c)
    })
  }

  const handleDeleteTestCase = (caseId: string) => {
    if (!selectedTest) return
    handleUpdateTest(selectedTest.id, {
      testCases: selectedTest.testCases.filter(c => c.id !== caseId)
    })
  }

  const handleAddAssertion = (caseId: string) => {
    if (!selectedTest) return
    const testCase = selectedTest.testCases.find(c => c.id === caseId)
    if (!testCase) return
    handleUpdateTestCase(caseId, {
      assertions: [...testCase.assertions, unitTestDesignerCopy.defaults.assertion]
    })
  }

  const handleUpdateAssertion = (caseId: string, index: number, value: string) => {
    if (!selectedTest) return
    const testCase = selectedTest.testCases.find(c => c.id === caseId)
    if (!testCase) return
    const newAssertions = [...testCase.assertions]
    newAssertions[index] = value
    handleUpdateTestCase(caseId, { assertions: newAssertions })
  }

  const handleDeleteAssertion = (caseId: string, index: number) => {
    if (!selectedTest) return
    const testCase = selectedTest.testCases.find(c => c.id === caseId)
    if (!testCase) return
    handleUpdateTestCase(caseId, {
      assertions: testCase.assertions.filter((_, i) => i !== index)
    })
  }

  const handleGenerateWithAI = async () => {
    const description = prompt(unitTestDesignerCopy.prompts.generateDescription)
    if (!description) return

    try {
      toast.info(unitTestDesignerCopy.toasts.generating)
      const promptText = unitTestDesignerCopy.prompts.generatePromptTemplate.replace(
        '{{description}}',
        description
      )
      const response = await llm(promptText, 'claude-sonnet', true)
      const parsed = JSON.parse(response)
      onTestsChange([...tests, parsed.test])
      setSelectedTestId(parsed.test.id)
      toast.success(unitTestDesignerCopy.toasts.generateSuccess)
    } catch (error) {
      console.error(error)
      toast.error(unitTestDesignerCopy.toasts.generateError)
    }
  }

  return {
    selectedTestId,
    selectedTest,
    setSelectedTestId,
    handleAddTest,
    handleDeleteTest,
    handleUpdateTest,
    handleAddTestCase,
    handleUpdateTestCase,
    handleDeleteTestCase,
    handleAddAssertion,
    handleUpdateAssertion,
    handleDeleteAssertion,
    handleGenerateWithAI,
    copy: unitTestDesignerCopy,
  }
}
