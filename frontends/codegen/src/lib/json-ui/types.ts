import type { Action, EventHandler, FormField, JSONEventDefinition, JSONEventMap, UIComponent } from './schema'

export type { Action, EventHandler, FormField, JSONEventDefinition, JSONEventMap, UIComponent }

export interface JSONUIRendererProps {
  component: UIComponent
  dataMap?: Record<string, unknown>
  onAction?: (actions: Action[], event?: unknown) => void
  context?: Record<string, unknown>
}

export interface JSONFormRendererProps {
  formData: Record<string, unknown>
  fields: FormField[]
  onSubmit: (data: Record<string, unknown>) => void
  onChange?: (data: Record<string, unknown>) => void
}
