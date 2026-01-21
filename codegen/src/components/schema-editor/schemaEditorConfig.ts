import config from '@/data/schema-editor/schema-editor-page.json'

export interface SchemaEditorConfig {
  schema: {
    id: string
    name: string
    layout: {
      type: string
    }
  }
  export: {
    fileName: string
  }
  import: {
    accept: string
  }
  preview: {
    message: string
  }
}

export const schemaEditorConfig = config as SchemaEditorConfig
