import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PencilSimple, Trash } from '@phosphor-icons/react'
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
  <div className="space-y-6">
    <div>
      <Label className="mb-3 block">{copy.elements.addTitle}</Label>
      <div className="grid grid-cols-4 gap-2">
        {ELEMENT_TYPES.map(({ value, icon: Icon }) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            onClick={() => onAddElement(value as FaviconElement['type'])}
            className="flex flex-col gap-1 h-auto py-2"
            disabled={drawMode !== 'select'}
          >
            <Icon size={20} />
            <span className="text-xs">
              {copy.elementTypes[value as keyof typeof copy.elementTypes]}
            </span>
          </Button>
        ))}
      </div>
      {drawMode !== 'select' && <p className="text-xs text-muted-foreground mt-2">{copy.elements.selectHint}</p>}
    </div>

    <div>
      <Label className="mb-3 block">{formatCopy(copy.elements.listTitle, { count: activeDesign.elements.length })}</Label>
      <ScrollArea className="h-40">
        <div className="space-y-2">
          {activeDesign.elements.map((element) => (
            <div
              key={element.id}
              className={`flex items-center justify-between p-2 rounded border cursor-pointer ${
                selectedElementId === element.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/50'
              }`}
              onClick={() => {
                if (drawMode === 'select') {
                  onSelectElement(element.id)
                }
              }}
            >
              <div className="flex items-center gap-2">
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
                <span className="text-sm capitalize">
                  {copy.elementTypes[element.type as keyof typeof copy.elementTypes] || element.type}
                </span>
                {element.text && <span className="text-xs text-muted-foreground">"{element.text}"</span>}
                {element.emoji && <span className="text-xs">{element.emoji}</span>}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation()
                  onDeleteElement(element.id)
                }}
              >
                <Trash size={14} />
              </Button>
            </div>
          ))}
          {activeDesign.elements.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{copy.elements.empty}</p>
          )}
        </div>
      </ScrollArea>
    </div>
  </div>
)
