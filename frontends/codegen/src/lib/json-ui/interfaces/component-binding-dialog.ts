export interface ComponentBindingField {
  id: string
  label: string
  value?: string
  placeholder?: string
}

export interface ComponentBindingDialogProps {
  open?: boolean
  title?: string
  description?: string
  componentType?: string
  componentId?: string
  bindings?: ComponentBindingField[]
  onBindingChange?: (id: string, value: string) => void
  onSave?: () => void
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
  className?: string
}
