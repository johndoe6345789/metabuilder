export interface PageComponentConfig {
  id: string
  type: string
  [key: string]: any
}

export interface PageLayoutConfig {
  type: string
  spacing?: string
  sections?: PageSectionConfig[]
  [key: string]: any
}

export interface PageSectionConfig {
  type: string
  [key: string]: any
}

export interface LegacyPageSchema {
  id: string
  layout: PageLayoutConfig
  dashboardCards?: any[]
  statCards?: any[]
  [key: string]: any
}

export interface ComponentRendererProps {
  config?: Record<string, any>
  schema?: LegacyPageSchema
  data?: Record<string, any>
  functions?: Record<string, (...args: any[]) => any>
}
