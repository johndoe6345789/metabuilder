import config from '@/data/schema-editor/component-tree.json'

export interface ComponentTreeConfig {
  icon: string
  title: string
  subtitle: {
    singular: string
    plural: string
  }
  tooltips: {
    expandAll: string
    collapseAll: string
  }
  emptyState: {
    title: string
    description: string
  }
}

export const componentTreeConfig = config as ComponentTreeConfig
