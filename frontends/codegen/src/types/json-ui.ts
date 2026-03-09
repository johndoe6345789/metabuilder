import type { JSONUIComponentType } from './json-ui-component-types'

export type ComponentType = JSONUIComponentType

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

export type ActionType =
  | 'create' | 'update' | 'delete' | 'navigate'
  | 'show-toast' | 'open-dialog' | 'close-dialog'
  | 'set-value' | 'toggle-value' | 'increment' | 'decrement'
  | 'custom'

export type DataSourceType =
  | 'kv' | 'static'

export type BindingSourceType =
  | 'data' | 'bindings' | 'state'

export interface DataSource {
  id: string
  type: DataSourceType
  key?: string
  defaultValue?: any
  expression?: string
  valueTemplate?: Record<string, any>
  dependencies?: string[]
}

export interface Action {
  id: string
  type: ActionType
  target?: string
  path?: string
  value?: any
  params?: Record<string, any>
  // New: JSON-friendly expression (e.g., "event.target.value", "data.fieldName")
  expression?: string
  // New: JSON template with dynamic values
  valueTemplate?: Record<string, any>
  message?: string
  variant?: 'success' | 'error' | 'info' | 'warning'
}

export interface Binding {
  source: string
  sourceType?: BindingSourceType
  path?: string
  transform?: string
}

export interface EventHandler {
  event: string
  actions: Action[]
  condition?: string
}

export interface JSONEventDefinition {
  action?: string
  actions?: Action[]
  payload?: Record<string, any>
  condition?: string
}

export type JSONEventMap = Record<string, JSONEventDefinition | JSONEventDefinition[] | string>

export interface Conditional {
  if: string
  then?: UIComponent | (UIComponent | string)[] | string
  else?: UIComponent | (UIComponent | string)[] | string
}

export interface Loop {
  source: string
  itemVar: string
  indexVar?: string
}

export interface UIComponent {
  id: string
  type: ComponentType
  props?: Record<string, any>
  className?: string
  style?: Record<string, any>
  bindings?: Record<string, Binding>
  dataBinding?: string | Binding
  events?: EventHandler[] | JSONEventMap
  children?: UIComponent[] | string
  condition?: Binding
  conditional?: Conditional
  loop?: Loop
}

export interface Layout {
  type: 'single' | 'split' | 'tabs' | 'grid'
  areas?: LayoutArea[]
  columns?: number
  gap?: number
}

export interface LayoutArea {
  id: string
  component: UIComponent
  size?: number
}

export interface PageSchema {
  id: string
  name: string
  layout: Layout
  dataSources: DataSource[]
  components: UIComponent[]
  globalActions?: Action[]
}

export interface JSONUIContext {
  data: Record<string, any>
  updateData: (sourceId: string, value: any) => void
  updatePath: (sourceId: string, path: string, value: any) => void
  executeAction: (action: Action, event?: any) => Promise<void>
}

export interface ComponentRendererProps {
  component: UIComponent
  data: Record<string, unknown>
  context?: Record<string, unknown>
  state?: Record<string, unknown>
  onEvent?: (componentId: string, handler: EventHandler, eventData: unknown) => void
}

export type ComponentSchema = UIComponent
