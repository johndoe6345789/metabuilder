import { PropConfig } from './prop-config'

export interface ResizableConfig {
  leftComponent: string
  leftProps: PropConfig
  leftPanel: {
    defaultSize: number
    minSize: number
    maxSize: number
  }
  rightPanel: {
    defaultSize: number
  }
}
