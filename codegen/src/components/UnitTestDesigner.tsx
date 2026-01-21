/// <reference path="../global.d.ts" />

import { useState } from 'react'
import { UnitTest, TestCase } from '@/types/project'
import { Button } from '@/components/ui/button'
import { Plus, Flask } from '@phosphor-icons/react'
import { toast } from 'sonner'
import unitTestDesignerCopy from '@/data/unit-test-designer.json'
import { TestSuiteList } from '@/components/unit-test-designer/TestSuiteList'
import { TestSuiteEditor } from '@/components/unit-test-designer/TestSuiteEditor'
import { TestCasesPanel } from '@/components/unit-test-designer/TestCasesPanel'

interface UnitTestDesignerProps {
  tests: UnitTest[]
  onTestsChange: (tests: UnitTest[]) => void
}

export function UnitTestDesigner({ tests, onTestsChange }: UnitTestDesignerProps) {
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
      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const parsed = JSON.parse(response)
      onTestsChange([...tests, parsed.test])
      setSelectedTestId(parsed.test.id)
      toast.success(unitTestDesignerCopy.toasts.generateSuccess)
    } catch (error) {
      console.error(error)
      toast.error(unitTestDesignerCopy.toasts.generateError)
    }
  }

  return (
    <div className="h-full flex">
      <TestSuiteList
        tests={tests}
        selectedTestId={selectedTestId}
        onSelectTest={setSelectedTestId}
        onAddTest={handleAddTest}
        onDeleteTest={handleDeleteTest}
        onGenerateWithAI={handleGenerateWithAI}
      />

      <div className="flex-1 p-6">
        {selectedTest ? (
          <div className="space-y-6">
            <TestSuiteEditor test={selectedTest} onUpdateTest={handleUpdateTest} />
            <TestCasesPanel
              testCases={selectedTest.testCases}
              onAddTestCase={handleAddTestCase}
              onDeleteTestCase={handleDeleteTestCase}
              onUpdateTestCase={handleUpdateTestCase}
              onAddAssertion={handleAddAssertion}
              onUpdateAssertion={handleUpdateAssertion}
              onDeleteAssertion={handleDeleteAssertion}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Flask size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {unitTestDesignerCopy.labels.noTestSuiteSelected}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {unitTestDesignerCopy.labels.noTestSuiteSelectedBody}
              </p>
              <Button onClick={handleAddTest}>
                <Plus size={16} className="mr-2" />
                {unitTestDesignerCopy.labels.createTestSuite}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
