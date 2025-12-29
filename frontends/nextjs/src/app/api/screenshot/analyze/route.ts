import { NextResponse } from 'next/server'

import { readJson } from '@/lib/api/read-json'
import { ScreenshotAnalysisService } from '@/lib/screenshot/screenshot-analysis-service'
import type { ScreenshotAnalysisPayload } from '@/lib/screenshot/types'

const MAX_TEXT_SAMPLE = 4000
const MAX_HTML_SAMPLE = 6000

export async function POST(request: Request) {
  const body = await readJson<Partial<ScreenshotAnalysisPayload>>(request)

  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const url = typeof body.url === 'string' ? body.url.trim() : ''
  const viewport = body.viewport
  const width = typeof viewport?.width === 'number' ? viewport.width : 0
  const height = typeof viewport?.height === 'number' ? viewport.height : 0

  if (!title || !url || width <= 0 || height <= 0) {
    return NextResponse.json({ error: 'title, url, and viewport are required' }, { status: 400 })
  }

  const textSample =
    typeof body.textSample === 'string' ? body.textSample.slice(0, MAX_TEXT_SAMPLE) : ''
  const htmlSample =
    typeof body.htmlSample === 'string' ? body.htmlSample.slice(0, MAX_HTML_SAMPLE) : ''

  const service = new ScreenshotAnalysisService()
  const analysis = service.analyze({
    title,
    url,
    viewport: { width, height },
    textSample,
    htmlSample,
  })

  return NextResponse.json(analysis)
}
