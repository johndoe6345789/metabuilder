import { UnitTest } from '@/types/project'
import { Button, Input, Textarea } from '@metabuilder/fakemui/inputs'
import { Card, CardContent, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Label } from '@metabuilder/fakemui/atoms'
import { Flask } from '@metabuilder/fakemui/icons'
import unitTestDesignerCopy from '@/data/unit-test-designer.json'

interface TestSuiteEditorProps {
  test: UnitTest
  onUpdateTest: (testId: string, updates: Partial<UnitTest>) => void
}

export function TestSuiteEditor({ test, onUpdateTest }: TestSuiteEditorProps) {
  return (
    <div className="test-suite-editor">
      <div className="test-suite-editor__header">
        <h2 className="test-suite-editor__title">{unitTestDesignerCopy.labels.testSuiteConfiguration}</h2>
        <Button variant="outlined">
          <Flask size={16} weight="fill" />
          {unitTestDesignerCopy.labels.runTests}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{unitTestDesignerCopy.labels.testSuiteDetails}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="test-suite-editor__fields">
            <div className="test-suite-editor__field">
              <Label htmlFor="test-name">{unitTestDesignerCopy.labels.testSuiteName}</Label>
              <Input
                id="test-name"
                value={test.name}
                onChange={event => onUpdateTest(test.id, { name: event.target.value })}
              />
            </div>
            <div className="test-suite-editor__field">
              <Label htmlFor="test-description">{unitTestDesignerCopy.labels.description}</Label>
              <Textarea
                id="test-description"
                value={test.description}
                onChange={event => onUpdateTest(test.id, { description: event.target.value })}
                placeholder={unitTestDesignerCopy.placeholders.testSuiteDescription}
              />
            </div>
            <div className="test-suite-editor__row">
              <div className="test-suite-editor__field">
                <Label htmlFor="test-type">{unitTestDesignerCopy.labels.testType}</Label>
                <select
                  id="test-type"
                  className="test-suite-editor__select"
                  value={test.testType}
                  onChange={event => onUpdateTest(test.id, { testType: event.target.value as UnitTest['testType'] })}
                >
                  <option value="component">{unitTestDesignerCopy.testTypes.component}</option>
                  <option value="function">{unitTestDesignerCopy.testTypes.function}</option>
                  <option value="hook">{unitTestDesignerCopy.testTypes.hook}</option>
                  <option value="integration">{unitTestDesignerCopy.testTypes.integration}</option>
                </select>
              </div>
              <div className="test-suite-editor__field">
                <Label htmlFor="target-file">{unitTestDesignerCopy.labels.targetFile}</Label>
                <Input
                  id="target-file"
                  value={test.targetFile}
                  onChange={event => onUpdateTest(test.id, { targetFile: event.target.value })}
                  placeholder={unitTestDesignerCopy.placeholders.targetFile}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
