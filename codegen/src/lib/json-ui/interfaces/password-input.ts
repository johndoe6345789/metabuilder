export interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: boolean
  helperText?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}
