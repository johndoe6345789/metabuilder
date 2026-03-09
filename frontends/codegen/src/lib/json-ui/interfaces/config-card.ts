export interface ConfigField {
  id: string
  key: string
  label: string
  placeholder: string
  helper?: string
}

export interface ConfigCardProps {
  title: string
  description: string
  fields: ConfigField[]
  onFieldChange: (field: ConfigField, value: string) => void
}
