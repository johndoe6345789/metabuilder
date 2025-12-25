/**
 * ComponentType - All supported UI component types in the builder
 * @description Union type of all available components
 * Supports: Layout (Flex, Grid, Container), Input (Input, Select, Switch), 
 * Display (Text, Heading, Badge), Interactive (Button, Dialog, Tabs)
 */
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

/**
 * ComponentProps - Dynamic property object for any component
 * @description Flexible key-value pairs for component configuration
 * @example { className: "mt-4", disabled: true, onClick: fn }
 */
export interface ComponentProps {
  [key: string]: any
}

/**
 * ComponentInstance - A single component in the component tree
 * @description Represents a rendered component with its properties and children
 * @property id - Unique identifier for this component instance
 * @property type - The type of component (Button, Input, etc.)
 * @property props - Properties passed to the component
 * @property children - Child component instances (for container components)
 * @property customCode - Optional custom code/logic for this component
 * @example
 * {
 *   id: "btn-submit",
 *   type: "Button",
 *   props: { label: "Submit" },
 *   children: []
 * }
 */
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
