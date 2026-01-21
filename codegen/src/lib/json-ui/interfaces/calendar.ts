export interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  mode?: 'single' | 'multiple' | 'range'
  disabled?: Date | ((date: Date) => boolean)
  className?: string
}
