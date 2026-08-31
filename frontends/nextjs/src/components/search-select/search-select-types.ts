export interface SearchSelectItem {
  id: string
  label: string
}

export interface SearchSelectProps {
  tenant?: string
  packageName: string
  entity: string
  placeholder?: string
  /** Extracts the display label from a raw DBAL record. */
  getLabel: (record: Record<string, unknown>) => string
  onSelect: (item: SearchSelectItem) => void
}

export interface UseSearchSelectArgs {
  tenant: string
  packageName: string
  entity: string
  getLabel: (record: Record<string, unknown>) => string
  onSelect: (item: SearchSelectItem) => void
}
