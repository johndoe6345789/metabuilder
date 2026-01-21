import { useSchemaEditor } from '@/hooks/ui/use-schema-editor'
import { useDragDrop } from '@/hooks/ui/use-drag-drop'
import { useJsonExport } from '@/hooks/ui/use-json-export'
import { SchemaEditorLayout } from '@/components/organisms'
import { ComponentDefinition } from '@/lib/component-definition-types'
import { UIComponent, PageSchema } from '@/types/json-ui'
import { toast } from 'sonner'
import { schemaEditorConfig } from '@/components/schema-editor/schemaEditorConfig'

export function SchemaEditorWorkspace() {
  const {
    components,
    selectedId,
    hoveredId,
    setSelectedId,
    setHoveredId,
    findComponentById,
    addComponent,
    updateComponent,
    deleteComponent,
    moveComponent,
    clearAll,
  } = useSchemaEditor()

  const {
    draggedItem,
    dropTarget,
    dropPosition,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragDrop()

  const { exportToJson, copyToClipboard, importFromJson } = useJsonExport()

  const createSchema = (): PageSchema => ({
    id: schemaEditorConfig.schema.id,
    name: schemaEditorConfig.schema.name,
    layout: schemaEditorConfig.schema.layout,
    dataSources: [],
    components,
  })

  const handleComponentDragStart = (component: ComponentDefinition, e: React.DragEvent) => {
    const newComponent: UIComponent = {
      id: `${component.type.toLowerCase()}-${Date.now()}`,
      type: component.type,
      props: component.defaultProps || {},
      children: component.canHaveChildren ? [] : undefined,
    }

    handleDragStart(
      {
        id: 'new',
        type: 'component',
        data: newComponent,
      },
      e,
    )
  }

  const handleComponentTreeDragStart = (id: string, e: React.DragEvent) => {
    handleDragStart(
      {
        id,
        type: 'existing',
        data: id,
      },
      e,
    )
  }

  const handleCanvasDrop = (targetId: string, e: React.DragEvent) => {
    if (!draggedItem) return

    const position = dropPosition || 'inside'

    if (draggedItem.type === 'component') {
      addComponent(draggedItem.data, targetId === 'root' ? undefined : targetId, position)
    } else if (draggedItem.type === 'existing') {
      if (draggedItem.data !== targetId) {
        moveComponent(draggedItem.data, targetId, position)
      }
    }

    handleDrop(targetId, e)
  }

  const handleExportJson = () => {
    exportToJson(createSchema(), schemaEditorConfig.export.fileName)
  }

  const handleCopyJson = () => {
    copyToClipboard(createSchema())
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = schemaEditorConfig.import.accept
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement
      const file = target?.files?.[0]
      if (file) {
        importFromJson(file, (data) => {
          if (data.components) {
            clearAll()
            data.components.forEach((comp: UIComponent) => {
              addComponent(comp)
            })
          }
        })
      }
    }
    input.click()
  }

  const handlePreview = () => {
    toast.info(schemaEditorConfig.preview.message)
  }

  const selectedComponent = selectedId ? findComponentById(selectedId) : null

  return (
    <SchemaEditorLayout
      components={components}
      selectedId={selectedId}
      hoveredId={hoveredId}
      draggedOverId={dropTarget}
      dropPosition={dropPosition}
      selectedComponent={selectedComponent}
      onSelect={setSelectedId}
      onHover={setHoveredId}
      onHoverEnd={() => setHoveredId(null)}
      onComponentDragStart={handleComponentDragStart}
      onTreeDragStart={handleComponentTreeDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleCanvasDrop}
      onUpdate={(updates) => {
        if (selectedId) {
          updateComponent(selectedId, updates)
        }
      }}
      onDelete={() => {
        if (selectedId) {
          deleteComponent(selectedId)
        }
      }}
      onImport={handleImport}
      onExport={handleExportJson}
      onCopy={handleCopyJson}
      onPreview={handlePreview}
      onClear={clearAll}
    />
  )
}
