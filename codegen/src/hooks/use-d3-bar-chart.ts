/**
 * Hook for calculating D3 bar chart dimensions and positions
 */
export interface BarChartData {
  label: string
  value: number
}

export interface BarPosition {
  x: number
  y: number
  width: number
  height: number
  label: string
  value: number
  labelX: number
  labelY: number
  valueX: number
  valueY: number
}

export interface ChartDimensions {
  innerWidth: number
  innerHeight: number
  margin: { top: number; right: number; bottom: number; left: number }
  translateX: number
  translateY: number
  bars: BarPosition[]
}

export function useD3BarChart(
  data: BarChartData[],
  width: number = 600,
  height: number = 300
): ChartDimensions {
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }
  const innerWidth = Math.max(width - margin.left - margin.right, 0)
  const innerHeight = Math.max(height - margin.top - margin.bottom, 0)
  const maxValue = Math.max(...data.map((item) => item.value), 0)
  const barGap = 8
  const barCount = data.length
  const totalGap = barCount > 1 ? barGap * (barCount - 1) : 0
  const barWidth = barCount > 0 ? Math.max((innerWidth - totalGap) / barCount, 0) : 0
  
  const bars: BarPosition[] = data.map((item, index) => {
    const barHeight = maxValue ? (item.value / maxValue) * innerHeight : 0
    const x = index * (barWidth + barGap)
    const y = innerHeight - barHeight
    
    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      label: item.label,
      value: item.value,
      labelX: x + barWidth / 2,
      labelY: innerHeight + 16,
      valueX: x + barWidth / 2,
      valueY: Math.max(y - 6, 0)
    }
  })
  
  return {
    innerWidth,
    innerHeight,
    margin,
    translateX: margin.left,
    translateY: margin.top,
    bars
  }
}
