export interface RangeSliderProps {
  value?: [number, number]
  onChange?: (value: [number, number]) => void
  min?: number
  max?: number
  step?: number
  label?: string
  showValue?: boolean
  className?: string
}
