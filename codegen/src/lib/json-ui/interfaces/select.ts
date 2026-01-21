export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  value?: string
  onChange?: (value: string) => void
  options?: SelectOption[]
  label?: string
  placeholder?: string
  error?: boolean
  helperText?: string
  disabled?: boolean
  className?: string
}
