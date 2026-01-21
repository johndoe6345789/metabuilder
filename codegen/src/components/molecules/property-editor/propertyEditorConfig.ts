import config from '@/data/schema-editor/property-editor.json'

export type PropertyEditorFieldType = 'text' | 'select' | 'boolean' | 'textarea' | 'number'

export interface PropertyEditorOption {
  label: string
  value: string
}

export interface PropertyEditorFieldDefinition {
  name: string
  label: string
  type: PropertyEditorFieldType
  options?: PropertyEditorOption[]
}

export interface PropertyEditorConfig {
  icon: string
  title: string
  emptyState: {
    title: string
    description: string
  }
  sections: {
    componentProps: string
    commonProps: string
  }
  commonProps: PropertyEditorFieldDefinition[]
  typeSpecificProps: Record<string, PropertyEditorFieldDefinition[]>
}

export const propertyEditorConfig = config as PropertyEditorConfig
