import { PageSchema } from './json-ui'
import { PropConfig } from './prop-config'
import { ResizableConfig } from './resizable-config'

export interface BasePageConfig {
  id: string
  title: string
  icon: string
  enabled: boolean
  isRoot?: boolean
  toggleKey?: string
  shortcut?: string
  order: number
  requiresResizable?: boolean
  props?: PropConfig
  resizableConfig?: ResizableConfig
}

export interface ComponentPageConfig extends BasePageConfig {
  type?: 'component'
  component: string
  schemaPath?: undefined
  schema?: undefined
}

export interface JsonPageConfig extends BasePageConfig {
  type: 'json'
  component?: undefined
  schemaPath?: string
  schema?: PageSchema
}

export type PageConfig = ComponentPageConfig | JsonPageConfig
