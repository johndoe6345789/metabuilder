export interface DropdownConfig {
  id: string
  name: string
  options: Array<{ label: string; value: string }>
  defaultValue?: string | null
}
