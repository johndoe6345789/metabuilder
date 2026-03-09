import { Binding, DataSource } from '@/types/json-ui'

export interface BindingEditorProps {
  bindings: Record<string, Binding>
  dataSources: DataSource[]
  availableProps: string[]
  onChange: (bindings: Record<string, Binding>) => void
}
