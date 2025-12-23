import { useState } from 'react'
import type { ComponentInstance, ComponentDefinition } from '@/lib/builder-types'
import { RenderComponent } from './RenderComponent'

interface CanvasProps {
  components: ComponentInstance[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDrop: (component: ComponentDefinition) => void
  isDragging: boolean
}

export function Canvas({ components, selectedId, onSelect, onDrop, isDragging }: CanvasProps) {
  const [isOver, setIsOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = () => {
    setIsOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    onDrop(JSON.parse(e.dataTransfer.getData('component')))
  }

  return (
    <div
      className={`flex-1 bg-canvas p-8 overflow-auto transition-colors ${
        isOver ? 'bg-drop-zone' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`min-h-[600px] bg-card rounded-lg p-6 border-2 transition-all ${
          isOver
            ? 'border-drop-zone-border border-dashed'
            : 'border-border'
        }`}
      >
        {components.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="space-y-2">
              <p className="text-lg font-medium text-muted-foreground">
                Drop components here to start building
              </p>
              <p className="text-sm text-muted-foreground">
                Drag components from the left sidebar onto this canvas
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {components.map(component => (
              <RenderComponent
                key={component.id}
                component={component}
                isSelected={selectedId === component.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
