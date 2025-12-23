export type ComponentType =
  | 'Button'
  | 'Input'
  | 'Card'
  | 'Table'
  | 'Badge'
  | 'Select'
  | 'Switch'
  | 'Checkbox'
  | 'Textarea'
  | 'Label'
  | 'Separator'
  | 'Dialog'
  | 'Tabs'
  | 'Avatar'
  | 'Alert'
  | 'Progress'
  | 'Slider'
  | 'Calendar'
  | 'Accordion'
  | 'Container'
  | 'Flex'
  | 'Grid'
  | 'Stack'
  | 'Text'
  | 'Heading'
  | 'IRCWebchat'
  | string

export interface ComponentProps {
  [key: string]: any
}

export interface ComponentInstance {
  id: string
  type: ComponentType | string
  props: ComponentProps
  children: ComponentInstance[]
  customCode?: string
}

export interface BuilderState {
  components: ComponentInstance[]
  selectedId: string | null
}

export interface ComponentDefinition {
  type: ComponentType
  label: string
  icon: string
  category: 'Layout' | 'Input' | 'Display' | 'Feedback' | 'Typography' | 'Data'
  defaultProps: ComponentProps
  propSchema: PropDefinition[]
  allowsChildren: boolean
}

export interface PropDefinition {
  name: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'dynamic-select'
  defaultValue?: any
  options?: Array<{ value: string; label: string }>
  dynamicSource?: string
  description?: string
}

export interface UserCredentials {
  username: string
  password: string
}

export interface Session {
  authenticated: boolean
  username: string
  timestamp: number
}
