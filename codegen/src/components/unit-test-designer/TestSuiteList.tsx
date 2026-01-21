import { UnitTest } from '@/types/project'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Sparkle, Trash } from '@phosphor-icons/react'
import unitTestDesignerCopy from '@/data/unit-test-designer.json'

interface TestSuiteListProps {
  tests: UnitTest[]
  selectedTestId: string | null
  onSelectTest: (testId: string) => void
  onAddTest: () => void
  onDeleteTest: (testId: string) => void
  onGenerateWithAI: () => void
}

const getTestTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    component: 'bg-blue-500',
    function: 'bg-green-500',
    hook: 'bg-purple-500',
    integration: 'bg-orange-500'
  }
  return colors[type] || 'bg-gray-500'
}

export function TestSuiteList({
  tests,
  selectedTestId,
  onSelectTest,
  onAddTest,
  onDeleteTest,
  onGenerateWithAI
}: TestSuiteListProps) {
  return (
    <div className="w-80 border-r border-border bg-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-sm">{unitTestDesignerCopy.labels.testSuites}</h2>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={onGenerateWithAI}>
            <Sparkle size={14} weight="duotone" />
          </Button>
          <Button size="sm" onClick={onAddTest}>
            <Plus size={14} />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-2 space-y-1">
          {tests.map(test => (
            <div
              key={test.id}
              className={`p-3 rounded-md cursor-pointer flex items-start justify-between group ${
                selectedTestId === test.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
              }`}
              onClick={() => onSelectTest(test.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${getTestTypeColor(test.testType)}`} />
                  <div className="font-medium text-sm truncate">{test.name}</div>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {test.targetFile || unitTestDesignerCopy.labels.noFile}
                </div>
                <div className="text-xs text-muted-foreground">
                  {test.testCases.length} {unitTestDesignerCopy.labels.casesSuffix}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation()
                  onDeleteTest(test.id)
                }}
              >
                <Trash size={14} />
              </Button>
            </div>
          ))}
          {tests.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {unitTestDesignerCopy.labels.noTestSuitesYet}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
