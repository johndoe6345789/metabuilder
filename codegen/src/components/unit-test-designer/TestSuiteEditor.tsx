import { UnitTest } from '@/types/project'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Flask } from '@phosphor-icons/react'
import unitTestDesignerCopy from '@/data/unit-test-designer.json'

interface TestSuiteEditorProps {
  test: UnitTest
  onUpdateTest: (testId: string, updates: Partial<UnitTest>) => void
}

export function TestSuiteEditor({ test, onUpdateTest }: TestSuiteEditorProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{unitTestDesignerCopy.labels.testSuiteConfiguration}</h2>
        <Button variant="outline">
          <Flask size={16} className="mr-2" weight="fill" />
          {unitTestDesignerCopy.labels.runTests}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{unitTestDesignerCopy.labels.testSuiteDetails}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-name">{unitTestDesignerCopy.labels.testSuiteName}</Label>
            <Input
              id="test-name"
              value={test.name}
              onChange={event => onUpdateTest(test.id, { name: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-description">{unitTestDesignerCopy.labels.description}</Label>
            <Textarea
              id="test-description"
              value={test.description}
              onChange={event => onUpdateTest(test.id, { description: event.target.value })}
              placeholder={unitTestDesignerCopy.placeholders.testSuiteDescription}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-type">{unitTestDesignerCopy.labels.testType}</Label>
              <Select
                value={test.testType}
                onValueChange={(value: UnitTest['testType']) => onUpdateTest(test.id, { testType: value })}
              >
                <SelectTrigger id="test-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="component">{unitTestDesignerCopy.testTypes.component}</SelectItem>
                  <SelectItem value="function">{unitTestDesignerCopy.testTypes.function}</SelectItem>
                  <SelectItem value="hook">{unitTestDesignerCopy.testTypes.hook}</SelectItem>
                  <SelectItem value="integration">{unitTestDesignerCopy.testTypes.integration}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-file">{unitTestDesignerCopy.labels.targetFile}</Label>
              <Input
                id="target-file"
                value={test.targetFile}
                onChange={event => onUpdateTest(test.id, { targetFile: event.target.value })}
                placeholder={unitTestDesignerCopy.placeholders.targetFile}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
