import type { ScreenshotAnalysisPayload, ScreenshotAnalysisResult } from './types'

export async function requestScreenshotAnalysis(
  payload: ScreenshotAnalysisPayload
): Promise<ScreenshotAnalysisResult> {
  const response = await fetch('/api/screenshot/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as ScreenshotAnalysisResult | { error?: string } | null

  if (!response.ok || !data || 'error' in data) {
    const message = (data && 'error' in data && data.error) ? data.error : 'Analysis failed'
    throw new Error(message)
  }

  return data
}
