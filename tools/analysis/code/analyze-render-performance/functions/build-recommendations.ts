import { THRESHOLDS } from '../constants'
import { ComponentMetrics } from '../types'

export function buildRecommendations(slowComponents: ComponentMetrics[]): string[] {
  const recommendations: string[] = []

  if (slowComponents.length === 0) {
    recommendations.push('No high-risk components detected. Re-run after significant UI changes.')
    return recommendations
  }

  if (slowComponents.some(component => component.lines >= THRESHOLDS.veryLargeComponentLines)) {
    recommendations.push('Split components over 300 lines into smaller pieces to reduce render work.')
  }

  if (slowComponents.some(component => component.effects >= THRESHOLDS.highEffectCount)) {
    recommendations.push('Reduce the number of effects per component by extracting side effects into hooks.')
  }

  if (slowComponents.some(component => component.hooks.total >= THRESHOLDS.highHookCount)) {
    recommendations.push('Consider splitting stateful logic across smaller components or hooks.')
  }

  if (slowComponents.some(component => component.memoization === 0 && component.estimatedRenderTimeMs >= THRESHOLDS.slowRenderMs)) {
    recommendations.push('Add memoization (React.memo/useMemo/useCallback) where render work is heavy.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Review flagged components for unnecessary renders or expensive computations.')
  }

  return recommendations
}
