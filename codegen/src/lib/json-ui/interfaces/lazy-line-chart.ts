export interface LazyLineChartProps {
  data: Array<Record<string, any>>
  xKey: string
  yKey: string
  width?: number | string
  height?: number
  color?: string
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  className?: string
}
