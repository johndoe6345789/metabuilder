import { Trash } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

import { CssClassBuilder } from '@/components/CssClassBuilder'
import { Button, Separator } from '@/components/ui'
import { componentCatalog } from '@/lib/component-catalog'
import { Database, DropdownConfig } from '@/lib/database'
import type { ComponentInstance, ComponentProps } from '@/lib/types/builder-types'
import type { JsonValue } from '@/types/utility-types'

import { PropertyPanels } from './components/PropertyPanels'

interface PropertyInspectorProps {
  component: ComponentInstance | null
  onUpdate: (id: string, props: ComponentProps) => void
  onDelete: (id: string) => void
  onCodeEdit: () => void
}

export function PropertyInspector({
  component,
  onUpdate,
  onDelete,
  onCodeEdit,
}: PropertyInspectorProps) {
  const [cssBuilderOpen, setCssBuilderOpen] = useState(false)
  const [cssBuilderPropName, setCssBuilderPropName] = useState('')
  const [dynamicDropdowns, setDynamicDropdowns] = useState<DropdownConfig[]>([])

  useEffect(() => {
    loadDynamicDropdowns()
  }, [])

  const loadDynamicDropdowns = async () => {
    const dropdowns = await Database.getDropdownConfigs()
    setDynamicDropdowns(dropdowns)
  }

  if (!component) {
    return (
      <div className="w-80 bg-card border-l border-border p-6 flex items-center justify-center text-center">
        <p className="text-muted-foreground">Select a component to edit its properties</p>
      </div>
    )
  }

  const componentDef = componentCatalog.find(c => c.type === component.type)

  const handlePropChange = (propName: string, value: JsonValue) => {
    onUpdate(component.id, {
      ...component.props,
      [propName]: value,
    })
  }

  const openCssBuilder = (propName: string) => {
    setCssBuilderPropName(propName)
    setCssBuilderOpen(true)
  }

  const handleCssClassSave = (classes: string) => {
    handlePropChange(cssBuilderPropName, classes)
    setCssBuilderOpen(false)
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-screen">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold mb-1">{component.type}</h2>
        <p className="text-xs text-muted-foreground">Component Properties</p>
      </div>

      <PropertyPanels
        component={component}
        componentDef={componentDef}
        dynamicDropdowns={dynamicDropdowns}
        onPropChange={handlePropChange}
        onCodeEdit={onCodeEdit}
        onOpenCssBuilder={openCssBuilder}
      />

      <Separator />

      <div className="p-4">
        <Button variant="destructive" className="w-full" onClick={() => onDelete(component.id)}>
          <Trash className="mr-2" />
          Delete Component
        </Button>
      </div>

      <CssClassBuilder
        open={cssBuilderOpen}
        onClose={() => setCssBuilderOpen(false)}
        initialValue={
          typeof component.props[cssBuilderPropName] === 'string'
            ? component.props[cssBuilderPropName]
            : ''
        }
        onSave={handleCssClassSave}
      />
    </div>
  )
}
