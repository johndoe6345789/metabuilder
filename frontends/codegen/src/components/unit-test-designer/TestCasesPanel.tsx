import { TestCase } from '@/types/project'
import { Badge } from '@metabuilder/fakemui/data-display'
import { Button, IconButton, Input, Textarea } from '@metabuilder/fakemui/inputs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Label } from '@metabuilder/fakemui/atoms'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash } from '@metabuilder/fakemui/icons'
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
    <Card className="test-cases-panel">
      <CardHeader>
        <div className="test-cases-panel__header">
          <div>
            <CardTitle>{unitTestDesignerCopy.labels.testCases}</CardTitle>
            <CardDescription>{unitTestDesignerCopy.labels.testCasesDescription}</CardDescription>
          </div>
          <Button size="small" onClick={onAddTestCase}>
            <Plus size={14} />
            {unitTestDesignerCopy.labels.addTestCase}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="test-cases-panel__scroll">
          <div className="test-cases-panel__items">
            {testCases.map((testCase, index) => (
              <div key={testCase.id} className="test-case-card">
                <div className="test-case-card__header">
                  <Badge variant="outlined">
                    {unitTestDesignerCopy.labels.case} {index + 1}
                  </Badge>
                  <IconButton
                    size="small"
                    onClick={() => onDeleteTestCase(testCase.id)}
                  >
                    <Trash size={14} />
                  </IconButton>
                </div>
                <div className="test-case-card__body">
                  <div className="test-case-card__field">
                    <Label>{unitTestDesignerCopy.labels.caseDescription}</Label>
                    <Input
                      value={testCase.description}
                      onChange={event => onUpdateTestCase(testCase.id, { description: event.target.value })}
                      placeholder={unitTestDesignerCopy.placeholders.caseDescription}
                    />
                  </div>
                  <div className="test-case-card__field">
                    <Label>{unitTestDesignerCopy.labels.setupCode}</Label>
                    <Textarea
                      value={testCase.setup || ''}
                      onChange={event => onUpdateTestCase(testCase.id, { setup: event.target.value })}
                      placeholder={unitTestDesignerCopy.placeholders.setupCode}
                      rows={2}
                    />
                  </div>
                  <div className="test-case-card__assertions">
                    <div className="test-case-card__assertions-header">
                      <Label>{unitTestDesignerCopy.labels.assertions}</Label>
                      <IconButton size="small" onClick={() => onAddAssertion(testCase.id)}>
                        <Plus size={12} />
                      </IconButton>
                    </div>
                    <div className="test-case-card__assertion-list">
                      {testCase.assertions.map((assertion, assertionIndex) => (
                        <div key={assertionIndex} className="test-case-card__assertion-row">
                          <Input
                            value={assertion}
                            onChange={event =>
                              onUpdateAssertion(testCase.id, assertionIndex, event.target.value)
                            }
                            placeholder={unitTestDesignerCopy.placeholders.assertion}
                          />
                          <IconButton
                            size="small"
                            onClick={() => onDeleteAssertion(testCase.id, assertionIndex)}
                          >
                            <Trash size={12} />
                          </IconButton>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="test-case-card__field">
                    <Label>{unitTestDesignerCopy.labels.teardownCode}</Label>
                    <Textarea
                      value={testCase.teardown || ''}
                      onChange={event => onUpdateTestCase(testCase.id, { teardown: event.target.value })}
                      placeholder={unitTestDesignerCopy.placeholders.teardownCode}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
            {testCases.length === 0 && (
              <div className="test-cases-panel__empty">
                {unitTestDesignerCopy.labels.noTestCasesYet}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
