import { describe, it, expect } from 'vitest'
import { ScreenshotAnalysisService } from './screenshot-analysis-service'

const basePayload = {
  title: 'Test Page',
  url: 'https://example.com',
  viewport: { width: 1280, height: 720 },
  textSample: 'Hello world from the screenshot analyzer.',
  htmlSample:
    '<h1>Title</h1><h2>Subtitle</h2><img src="x" alt="desc" /><a href="#">Link</a><button>Go</button>',
}

describe('ScreenshotAnalysisService', () => {
  it('extracts basic metrics', () => {
    const service = new ScreenshotAnalysisService()
    const result = service.analyze(basePayload)

    expect(result.metrics.wordCount).toBeGreaterThan(0)
    expect(result.metrics.h1Count).toBe(1)
    expect(result.metrics.h2Count).toBe(1)
    expect(result.metrics.h3Count).toBe(0)
    expect(result.metrics.imgCount).toBe(1)
    expect(result.metrics.imgMissingAltCount).toBe(0)
    expect(result.metrics.linkCount).toBe(1)
    expect(result.metrics.buttonCount).toBe(1)
  })

  it('flags missing alt and missing h1 warnings', () => {
    const service = new ScreenshotAnalysisService()
    const result = service.analyze({
      ...basePayload,
      textSample: 'Short text',
      htmlSample: '<img src="x" /><button>Save</button>',
    })

    expect(result.warnings.some(warning => warning.includes('No H1'))).toBe(true)
    expect(result.warnings.some(warning => warning.includes('missing alt'))).toBe(true)
  })
})
