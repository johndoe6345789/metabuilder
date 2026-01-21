import { TestCase } from '@/types/project'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash } from '@phosphor-icons/react'
import unitTestDesignerCopy from '@/data/unit-test-designer.json'

interface TestCasesPanelProps {
  testCases: TestCase[]
  onAddTestCase: () => void
  onDeleteTestCase: (caseId: string) => void
  onUpdateTestCase: (caseId: string, updates: Partial<TestCase>) => void
  onAddAssertion: (caseId: string) => void
  onUpdateAssertion: (caseId: string, index: number, value: string) => void
  onDeleteAssertion: (caseId: string, index: number) => void
}

export function TestCasesPanel({
  testCases,
  onAddTestCase,
  onDeleteTestCase,
  onUpdateTestCase,
  onAddAssertion,
  onUpdateAssertion,
  onDeleteAssertion
}: TestCasesPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{unitTestDesignerCopy.labels.testCases}</CardTitle>
            <CardDescription>{unitTestDesignerCopy.labels.testCasesDescription}</CardDescription>
          </div>
          <Button size="sm" onClick={onAddTestCase}>
            <Plus size={14} className="mr-1" />
            {unitTestDesignerCopy.labels.addTestCase}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px]">
          <div className="space-y-4">
            {testCases.map((testCase, index) => (
              <Card key={testCase.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {unitTestDesignerCopy.labels.case} {index + 1}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteTestCase(testCase.id)}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>{unitTestDesignerCopy.labels.caseDescription}</Label>
                    <Input
                      value={testCase.description}
                      onChange={event => onUpdateTestCase(testCase.id, { description: event.target.value })}
                      placeholder={unitTestDesignerCopy.placeholders.caseDescription}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{unitTestDesignerCopy.labels.setupCode}</Label>
                    <Textarea
                      value={testCase.setup || ''}
                      onChange={event => onUpdateTestCase(testCase.id, { setup: event.target.value })}
                      placeholder={unitTestDesignerCopy.placeholders.setupCode}
                      className="font-mono text-xs"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{unitTestDesignerCopy.labels.assertions}</Label>
                      <Button size="sm" variant="outline" onClick={() => onAddAssertion(testCase.id)}>
                        <Plus size={12} />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {testCase.assertions.map((assertion, assertionIndex) => (
                        <div key={assertionIndex} className="flex gap-2">
                          <Input
                            value={assertion}
                            onChange={event =>
                              onUpdateAssertion(testCase.id, assertionIndex, event.target.value)
                            }
                            placeholder={unitTestDesignerCopy.placeholders.assertion}
                            className="font-mono text-xs"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteAssertion(testCase.id, assertionIndex)}
                          >
                            <Trash size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{unitTestDesignerCopy.labels.teardownCode}</Label>
                    <Textarea
                      value={testCase.teardown || ''}
                      onChange={event => onUpdateTestCase(testCase.id, { teardown: event.target.value })}
                      placeholder={unitTestDesignerCopy.placeholders.teardownCode}
                      className="font-mono text-xs"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {testCases.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {unitTestDesignerCopy.labels.noTestCasesYet}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
