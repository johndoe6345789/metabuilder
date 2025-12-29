import { Box, Card, CardContent, CardHeader, Chip, Grid, Typography } from '@mui/material'
import { useState } from 'react'
import { toast } from 'sonner'

import { captureDomSnapshot } from '@/lib/screenshot/capture-dom-snapshot'
import { requestScreenshotAnalysis } from '@/lib/screenshot/request-screenshot-analysis'
import type { ScreenshotAnalysisResult } from '@/lib/screenshot/types'

import { ResultPanel } from './screenshot-analyzer/ResultPanel'
import { UploadSection } from './screenshot-analyzer/UploadSection'

export function ScreenshotAnalyzer() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [screenshotData, setScreenshotData] = useState<string | null>(null)
  const [analysisReport, setAnalysisReport] = useState('')
  const [analysisResult, setAnalysisResult] = useState<ScreenshotAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const captureScreenshot = async () => {
    setIsCapturing(true)
    try {
      toast.info('Capturing screenshot...')
      const dataUrl = await captureDomSnapshot()
      setScreenshotData(dataUrl)
      toast.success('Screenshot captured!')

      await analyzeScreenshot()
    } catch (error) {
      console.error('Error capturing screenshot:', error)
      toast.error('Failed to capture screenshot')
    } finally {
      setIsCapturing(false)
    }
  }

  const analyzeScreenshot = async () => {
    setIsAnalyzing(true)
    try {
      const textSample = document.body.innerText.substring(0, 3000)
      const htmlSample = document.body.innerHTML.substring(0, 3000)

      const result = await requestScreenshotAnalysis({
        title: document.title,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        textSample,
        htmlSample,
      })

      setAnalysisReport(result.report)
      setAnalysisResult(result)
      toast.success('Analysis complete')
    } catch (error) {
      console.error('Error analyzing:', error)
      setAnalysisReport('')
      setAnalysisResult(null)
      toast.error('Failed to analyze screenshot')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const downloadScreenshot = () => {
    if (!screenshotData) return

    const link = document.createElement('a')
    link.href = screenshotData
    link.download = `screenshot-${Date.now()}.png`
    link.click()
    toast.success('Screenshot downloaded!')
  }

  return (
    <Box
      sx={{ maxWidth: 'lg', mx: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Screenshot Analyzer
          </Typography>
          <Typography color="text.secondary">Capture and analyze the current page</Typography>
        </Box>
        <Chip label="Local Analysis" color="secondary" />
      </Box>

      <UploadSection
        isCapturing={isCapturing}
        isAnalyzing={isAnalyzing}
        screenshotData={screenshotData}
        onCapture={captureScreenshot}
        onDownload={downloadScreenshot}
        onReanalyze={analyzeScreenshot}
      />

      <ResultPanel analysisReport={analysisReport} analysisResult={analysisResult} />

      <Card>
        <CardHeader title="Page Information" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Title:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {document.title}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                URL:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {typeof window !== 'undefined' ? window.location.href : ''}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Viewport:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {typeof window !== 'undefined'
                  ? `${window.innerWidth} × ${window.innerHeight}`
                  : ''}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                User Agent:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {typeof navigator !== 'undefined'
                  ? navigator.userAgent.substring(0, 50) + '...'
                  : ''}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
