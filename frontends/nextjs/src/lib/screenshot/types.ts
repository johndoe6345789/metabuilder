export interface ScreenshotAnalysisPayload {
  title: string
  url: string
  viewport: {
    width: number
    height: number
  }
  textSample: string
  htmlSample: string
}

export interface ScreenshotAnalysisMetrics {
  wordCount: number
  headingCount: number
  h1Count: number
  h2Count: number
  h3Count: number
  imgCount: number
  imgMissingAltCount: number
  linkCount: number
  buttonCount: number
  formCount: number
  inputCount: number
}

export interface ScreenshotAnalysisResult {
  report: string
  metrics: ScreenshotAnalysisMetrics
  warnings: string[]
}
