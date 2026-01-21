import { useState } from 'react'
import { DataSource, UIComponent } from '@/types/json-ui'
import dataBindingCopy from '@/data/data-binding-designer.json'

export function useDataBindingDesigner() {
  const [dataSources, setDataSources] = useState<DataSource[]>(
    dataBindingCopy.seed.dataSources as DataSource[],
  )

  const [mockComponents] = useState<UIComponent[]>(dataBindingCopy.seed.components)

  const [selectedComponent, setSelectedComponent] = useState<UIComponent | null>(null)
  const [bindingDialogOpen, setBindingDialogOpen] = useState(false)

  const handleEditBinding = (component: UIComponent) => {
    setSelectedComponent(component)
    setBindingDialogOpen(true)
  }

  const handleSaveBinding = (updatedComponent: UIComponent) => {
    console.log('Updated component bindings:', updatedComponent)
  }

  return {
    dataSources,
    setDataSources,
    mockComponents,
    selectedComponent,
    setSelectedComponent,
    bindingDialogOpen,
    setBindingDialogOpen,
    handleEditBinding,
    handleSaveBinding,
    dataBindingCopy,
  }
}
