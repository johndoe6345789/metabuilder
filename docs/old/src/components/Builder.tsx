import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { ComponentCatalog } from './ComponentCatalog'
import { Canvas } from './Canvas'
import { PropertyInspector } from './PropertyInspector'
import { CodeEditor } from './CodeEditor'
import type { ComponentInstance, ComponentDefinition, BuilderState } from '@/lib/builder-types'
import { FloppyDisk, SignOut, Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface BuilderProps {
  onLogout: () => void
}

export function Builder({ onLogout }: BuilderProps) {
  const [builderState, setBuilderState] = useKV<BuilderState>('gui_builder_state', {
    components: [],
    selectedId: null,
  })
  
  const [draggingComponent, setDraggingComponent] = useState<ComponentDefinition | null>(null)
  const [codeEditorOpen, setCodeEditorOpen] = useState(false)

  if (!builderState) return null

  const selectedComponent = builderState.components.find(c => c.id === builderState.selectedId) || null

  const handleDragStart = (component: ComponentDefinition) => {
    setDraggingComponent(component)
  }

  const handleDrop = (component: ComponentDefinition) => {
    const newComponent: ComponentInstance = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: component.type,
      props: { ...component.defaultProps },
      children: [],
    }

    setBuilderState(current => {
      if (!current) return { components: [newComponent], selectedId: newComponent.id }
      return {
        ...current,
        components: [...current.components, newComponent],
        selectedId: newComponent.id,
      }
    })

    toast.success(`${component.label} added to canvas`)
  }

  const handleSelect = (id: string) => {
    setBuilderState(current => {
      if (!current) return { components: [], selectedId: id }
      return {
        ...current,
        selectedId: id,
      }
    })
  }

  const handleUpdateProps = (id: string, props: any) => {
    setBuilderState(current => {
      if (!current) return { components: [], selectedId: null }
      return {
        ...current,
        components: current.components.map(comp =>
          comp.id === id ? { ...comp, props } : comp
        ),
      }
    })
  }

  const handleDelete = (id: string) => {
    setBuilderState(current => {
      if (!current) return { components: [], selectedId: null }
      return {
        ...current,
        components: current.components.filter(comp => comp.id !== id),
        selectedId: current.selectedId === id ? null : current.selectedId,
      }
    })
    toast.success('Component deleted')
  }

  const handleCodeSave = (code: string) => {
    if (!selectedComponent) return
    
    setBuilderState(current => {
      if (!current) return { components: [], selectedId: null }
      return {
        ...current,
        components: current.components.map(comp =>
          comp.id === selectedComponent.id ? { ...comp, customCode: code } : comp
        ),
      }
    })
    toast.success('Code saved')
  }

  const handleSaveProject = () => {
    toast.success('Project saved successfully')
  }

  const handlePreview = () => {
    toast.info('Preview mode coming soon')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ComponentCatalog onDragStart={handleDragStart} />

      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">GUI Builder</h1>
            <p className="text-xs text-muted-foreground">Visual Component Editor</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="mr-2" size={16} />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveProject}>
              <FloppyDisk className="mr-2" size={16} />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <SignOut className="mr-2" size={16} />
              Logout
            </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <Canvas
            components={builderState.components}
            selectedId={builderState.selectedId}
            onSelect={handleSelect}
            onDrop={handleDrop}
            isDragging={draggingComponent !== null}
          />

          <PropertyInspector
            component={selectedComponent}
            onUpdate={handleUpdateProps}
            onDelete={handleDelete}
            onCodeEdit={() => setCodeEditorOpen(true)}
          />
        </div>
      </div>

      <CodeEditor
        open={codeEditorOpen}
        onClose={() => setCodeEditorOpen(false)}
        code={selectedComponent?.customCode || ''}
        onSave={handleCodeSave}
        componentName={selectedComponent?.type || 'Component'}
      />
    </div>
  )
}
