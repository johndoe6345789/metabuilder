import type {
  ScreenshotAnalysisMetrics,
  ScreenshotAnalysisPayload,
  ScreenshotAnalysisResult,
} from './types'

export class ScreenshotAnalysisService {
  analyze(payload: ScreenshotAnalysisPayload): ScreenshotAnalysisResult {
    const metrics = this.extractMetrics(payload.textSample, payload.htmlSample)
    const warnings = this.generateWarnings(metrics)
    const report = this.buildReport(payload, metrics, warnings)

    return {
      report,
      metrics,
      warnings,
    }
  }

  private extractMetrics(textSample: string, htmlSample: string): ScreenshotAnalysisMetrics {
    const text = textSample.trim()
    const words = text ? text.split(/\s+/).filter(Boolean) : []

    const h1Count = this.countMatches(/<h1\b[^>]*>/gi, htmlSample)
    const h2Count = this.countMatches(/<h2\b[^>]*>/gi, htmlSample)
    const h3Count = this.countMatches(/<h3\b[^>]*>/gi, htmlSample)
    const imgTags = htmlSample.match(/<img\b[^>]*>/gi) ?? []

    return {
      wordCount: words.length,
      headingCount: h1Count + h2Count + h3Count,
      h1Count,
      h2Count,
      h3Count,
      imgCount: imgTags.length,
      imgMissingAltCount: imgTags.filter((tag) => !/\salt=/.test(tag)).length,
      linkCount: this.countMatches(/<a\b[^>]*>/gi, htmlSample),
      buttonCount: this.countMatches(/<button\b[^>]*>/gi, htmlSample),
      formCount: this.countMatches(/<form\b[^>]*>/gi, htmlSample),
      inputCount: this.countMatches(/<input\b[^>]*>/gi, htmlSample),
    }
  }

  private generateWarnings(metrics: ScreenshotAnalysisMetrics): string[] {
    const warnings: string[] = []

    if (metrics.wordCount < 30) {
      warnings.push('Very low visible text content detected (under 30 words).')
    }

    if (metrics.h1Count === 0) {
      warnings.push('No H1 heading found. Consider adding a primary page heading.')
    }

    if (metrics.h1Count > 1) {
      warnings.push('Multiple H1 headings found. Consider keeping a single primary heading.')
    }

    if (metrics.imgMissingAltCount > 0) {
      warnings.push(`Images missing alt text: ${metrics.imgMissingAltCount}.`)
    }

    if (metrics.formCount > 0 && metrics.inputCount === 0) {
      warnings.push('Form detected without input fields. Verify form structure.')
    }

    if (metrics.buttonCount === 0) {
      warnings.push('No buttons detected. If this is an interactive page, confirm CTA visibility.')
    }

    return warnings
  }

  private buildReport(
    payload: ScreenshotAnalysisPayload,
    metrics: ScreenshotAnalysisMetrics,
    warnings: string[]
  ): string {
    const lines: string[] = [
      'Screenshot Analysis (local heuristics)',
      `Page: ${payload.title || 'Untitled'}`,
      `URL: ${payload.url || 'Unknown URL'}`,
      `Viewport: ${payload.viewport.width}x${payload.viewport.height}`,
      '',
      'Content Signals:',
      `- Word count: ${metrics.wordCount}`,
      `- Headings: H1=${metrics.h1Count}, H2=${metrics.h2Count}, H3=${metrics.h3Count}`,
      `- Links: ${metrics.linkCount}`,
      `- Buttons: ${metrics.buttonCount}`,
      `- Images: ${metrics.imgCount} (missing alt: ${metrics.imgMissingAltCount})`,
      `- Forms: ${metrics.formCount} (inputs: ${metrics.inputCount})`,
      '',
      'Potential Issues:',
    ]

    if (warnings.length === 0) {
      lines.push('- None detected')
    } else {
      warnings.forEach((warning) => lines.push(`- ${warning}`))
    }

    return lines.join('\n')
  }

  private countMatches(pattern: RegExp, value: string): number {
    const matches = value.match(pattern)
    return matches ? matches.length : 0
  }
}
