import { useCallback, useEffect, useState } from 'react'
import { UIComponent } from '@/types/json-ui'

interface UseComponentBindingDialogOptions {
  component: UIComponent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (component: UIComponent) => void
}

export function useComponentBindingDialog({
  component,
  open,
  onOpenChange,
  onSave,
}: UseComponentBindingDialogOptions) {
  const [editingComponent, setEditingComponent] = useState<UIComponent | null>(component)

  useEffect(() => {
    if (open) {
      setEditingComponent(component)
    }
  }, [component, open])

  const updateBindings = useCallback((bindings: Record<string, any>) => {
    setEditingComponent(prev => (prev ? { ...prev, bindings } : prev))
  }, [])

  const handleSave = useCallback(() => {
    if (!editingComponent) return
    onSave(editingComponent)
    onOpenChange(false)
  }, [editingComponent, onOpenChange, onSave])

  return {
    editingComponent,
    handleSave,
    updateBindings,
  }
}
