export interface LazyD3BarChartProps {
  data: Array<{ label: string; value: number }>
  width?: number
  height?: number
  color?: string
  className?: string
}
