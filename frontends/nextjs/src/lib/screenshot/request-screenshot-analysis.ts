import type { ScreenshotAnalysisPayload, ScreenshotAnalysisResult } from './types'

function isValidResult(data: unknown): data is ScreenshotAnalysisResult {
  return (
    typeof data === 'object' &&
    data !== null &&
    'report' in data &&
    'metrics' in data &&
    'warnings' in data
  )
}

export async function requestScreenshotAnalysis(
  payload: ScreenshotAnalysisPayload
): Promise<ScreenshotAnalysisResult> {
  const response = await fetch('/api/screenshot/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as unknown

  if (!response.ok || !isValidResult(data)) {
    const message = (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string')
      ? data.error
      : 'Analysis failed'
    throw new Error(message)
  }

  return data
}
