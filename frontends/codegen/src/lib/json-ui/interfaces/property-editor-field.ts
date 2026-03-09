import type { ComponentProps } from 'react'
import type { PropertyEditorOption } from '@/components/molecules/property-editor/propertyEditorConfig'

export interface PropertyEditorFieldProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  label?: string
  name?: string
  value?: unknown
  type?: string
  options?: PropertyEditorOption[] | string[]
  onChange?: (key: string, value: unknown) => void
}
