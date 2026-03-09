import { PlaywrightTest } from '@/types/project'
import { Button, IconButton } from '@metabuilder/fakemui/inputs'
import { Plus, Sparkle, Trash } from '@metabuilder/fakemui/icons'
import copy from '@/data/playwright-designer.json'

interface TestListProps {
  tests: PlaywrightTest[]
  selectedTestId: string | null
  onSelect: (testId: string) => void
  onAddTest: () => void
  onDeleteTest: (testId: string) => void
  onGenerateWithAI: () => void
}

export function TestList({
  tests,
  selectedTestId,
  onSelect,
  onAddTest,
  onDeleteTest,
  onGenerateWithAI
}: TestListProps) {
  return (
    <div className="test-list">
      <div className="test-list__header">
        <h2 className="test-list__title">{copy.headers.tests}</h2>
        <div className="test-list__actions">
          <IconButton size="small" onClick={onGenerateWithAI}>
            <Sparkle size={14} weight="duotone" />
          </IconButton>
          <IconButton size="small" onClick={onAddTest}>
            <Plus size={14} />
          </IconButton>
        </div>
      </div>
      <div className="test-list__scroll">
        <div className="test-list__items">
          {tests.map(test => (
            <div
              key={test.id}
              className={`test-list__item${selectedTestId === test.id ? ' test-list__item--selected' : ''}`}
              onClick={() => onSelect(test.id)}
            >
              <div className="test-list__item-body">
                <div className="test-list__item-name">{test.name}</div>
                <div className="test-list__item-url">{test.pageUrl}</div>
                <div className="test-list__item-steps">
                  {test.steps.length} {copy.labels.steps}
                </div>
              </div>
              <div className="test-list__item-delete">
                <IconButton
                  size="small"
                  onClick={event => {
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
            <div className="test-list__empty">
              {copy.emptyStates.noTests}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
