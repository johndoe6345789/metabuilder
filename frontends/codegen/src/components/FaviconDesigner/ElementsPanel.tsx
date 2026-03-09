import { Button, IconButton } from '@metabuilder/fakemui/inputs'
import { Label } from '@metabuilder/fakemui/atoms'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PencilSimple, Trash } from '@metabuilder/fakemui/icons'
import copy from '@/data/favicon-designer.json'
import { ELEMENT_TYPES } from './constants'
import { formatCopy } from './formatCopy'
import { FaviconDesign, FaviconElement } from './types'

type ElementsPanelProps = {
  activeDesign: FaviconDesign
  drawMode: 'select' | 'draw' | 'erase'
  selectedElementId: string | null
  onAddElement: (type: FaviconElement['type']) => void
  onSelectElement: (id: string) => void
  onDeleteElement: (id: string) => void
}

export const ElementsPanel = ({
  activeDesign,
  drawMode,
  selectedElementId,
  onAddElement,
  onSelectElement,
  onDeleteElement,
}: ElementsPanelProps) => (
  <div>
    <div>
      <Label>{copy.elements.addTitle}</Label>
      <div>
        {ELEMENT_TYPES.map(({ value, icon: Icon }) => (
          <Button
            key={value}
            variant="outlined"
            size="small"
            onClick={() => onAddElement(value as FaviconElement['type'])}
            disabled={drawMode !== 'select'}
          >
            <Icon size={20} />
            <span>
              {copy.elementTypes[value as keyof typeof copy.elementTypes]}
            </span>
          </Button>
        ))}
      </div>
      {drawMode !== 'select' && <p>{copy.elements.selectHint}</p>}
    </div>

    <div>
      <Label>{formatCopy(copy.elements.listTitle, { count: activeDesign.elements.length })}</Label>
      <ScrollArea>
        <div>
          {activeDesign.elements.map((element) => (
            <div
              key={element.id}
              onClick={() => {
                if (drawMode === 'select') {
                  onSelectElement(element.id)
                }
              }}
            >
              <div>
                {element.type === 'freehand' ? (
                  <PencilSimple size={16} />
                ) : (
                  ELEMENT_TYPES.find((t) => t.value === element.type)?.icon && (
                    <span>
                      {(() => {
                        const Icon = ELEMENT_TYPES.find((t) => t.value === element.type)!.icon
                        return <Icon size={16} />
                      })()}
                    </span>
                  )
                )}
                <span>
                  {copy.elementTypes[element.type as keyof typeof copy.elementTypes] || element.type}
                </span>
                {element.text && <span>"{element.text}"</span>}
                {element.emoji && <span>{element.emoji}</span>}
              </div>
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation()
                  onDeleteElement(element.id)
                }}
              >
                <Trash size={14} />
              </IconButton>
            </div>
          ))}
          {activeDesign.elements.length === 0 && (
            <p>{copy.elements.empty}</p>
          )}
        </div>
      </ScrollArea>
    </div>
  </div>
)
