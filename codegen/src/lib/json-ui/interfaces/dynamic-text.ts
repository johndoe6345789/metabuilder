export interface DynamicTextProps {
  value: any
  format?: 'text' | 'number' | 'currency' | 'date' | 'time' | 'datetime' | 'boolean'
  currency?: string
  locale?: string
  className?: string
}
