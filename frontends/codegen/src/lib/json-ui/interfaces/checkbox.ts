export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  indeterminate?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
