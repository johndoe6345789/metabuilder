import { UnitTest } from '@/types/project'
import { IconButton } from '@metabuilder/fakemui/inputs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Sparkle, Trash } from '@metabuilder/fakemui/icons'
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
    component: '#3b82f6',
    function: '#22c55e',
    hook: '#a855f7',
    integration: '#f97316'
  }
  return colors[type] || '#6b7280'
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
    <div className="unit-test-list">
      <div className="unit-test-list__header">
        <h2 className="unit-test-list__title">{unitTestDesignerCopy.labels.testSuites}</h2>
        <div className="unit-test-list__actions">
          <IconButton size="small" onClick={onGenerateWithAI}>
            <Sparkle size={14} weight="duotone" />
          </IconButton>
          <IconButton size="small" onClick={onAddTest}>
            <Plus size={14} />
          </IconButton>
        </div>
      </div>
      <ScrollArea className="unit-test-list__scroll">
        <div className="unit-test-list__items">
          {tests.map(test => (
            <div
              key={test.id}
              className={`unit-test-list__item${selectedTestId === test.id ? ' unit-test-list__item--selected' : ''}`}
              onClick={() => onSelectTest(test.id)}
            >
              <div className="unit-test-list__item-body">
                <div className="unit-test-list__item-name-row">
                  <div
                    className="unit-test-list__item-indicator"
                    style={{ backgroundColor: getTestTypeColor(test.testType) }}
                  />
                  <div className="unit-test-list__item-name">{test.name}</div>
                </div>
                <div className="unit-test-list__item-file">
                  {test.targetFile || unitTestDesignerCopy.labels.noFile}
                </div>
                <div className="unit-test-list__item-count">
                  {test.testCases.length} {unitTestDesignerCopy.labels.casesSuffix}
                </div>
              </div>
              <div className="unit-test-list__item-delete">
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDeleteTest(test.id)
                  }}
                >
                  <Trash size={14} />
                </IconButton>
              </div>
            </div>
          ))}
          {tests.length === 0 && (
            <div className="unit-test-list__empty">
              {unitTestDesignerCopy.labels.noTestSuitesYet}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
