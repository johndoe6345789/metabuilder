export interface DropdownConfig {
  id: string
  name: string
  label: string
  options: Array<{ label: string; value: string }>
  defaultValue?: string | null
}
