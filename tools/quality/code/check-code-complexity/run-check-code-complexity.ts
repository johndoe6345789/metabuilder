import { analyzeComplexity } from './walk-directory'
import { buildSummary } from './build-summary'

export const runCheckCodeComplexity = (): string => {
  const results = analyzeComplexity()
  const summary = buildSummary(results)
  return JSON.stringify(summary, null, 2)
}
