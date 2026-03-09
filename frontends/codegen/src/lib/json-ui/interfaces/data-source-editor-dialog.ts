export interface DataSourceField {
  id: string
  label: string
  value?: string
  placeholder?: string
  helperText?: string
}

export interface DataSourceEditorDialogProps {
  open?: boolean
  title?: string
  description?: string
  fields?: DataSourceField[]
  onFieldChange?: (id: string, value: string) => void
  onSave?: () => void
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
  className?: string
}
