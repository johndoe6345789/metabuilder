import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  Grid2 as Grid,
} from '@mui/material'
import {
  CameraAlt as CameraIcon,
  Visibility as EyeIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { toast } from 'sonner'
import { captureDomSnapshot } from '@/lib/screenshot/capture-dom-snapshot'
import { requestScreenshotAnalysis } from '@/lib/screenshot/request-screenshot-analysis'
import type { ScreenshotAnalysisResult } from '@/lib/screenshot/types'

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
    <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Screenshot Analyzer</Typography>
          <Typography color="text.secondary">Capture and analyze the current page</Typography>
        </Box>
        <Chip label="Local Analysis" color="secondary" />
      </Box>

      <Card>
        <CardHeader
          title="Capture & Analyze"
          subheader="Create a DOM snapshot and run heuristic checks"
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              onClick={captureScreenshot}
              disabled={isCapturing || isAnalyzing}
              variant="contained"
              startIcon={<CameraIcon />}
              sx={{ flex: 1 }}
            >
              {isCapturing ? 'Capturing...' : 'Capture & Analyze'}
            </Button>

            {screenshotData && (
              <>
                <Button
                  onClick={downloadScreenshot}
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                >
                  Download
                </Button>

                <Button
                  onClick={analyzeScreenshot}
                  variant="outlined"
                  disabled={isAnalyzing}
                  startIcon={<RefreshIcon />}
                >
                  Re-analyze
                </Button>
              </>
            )}
          </Box>

          {isAnalyzing && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, gap: 1.5 }}>
              <CircularProgress size={24} />
              <Typography color="text.secondary">Analyzing with heuristics...</Typography>
            </Box>
          )}

          {analysisReport && !isAnalyzing && (
            <Card variant="outlined" sx={{ bgcolor: 'action.hover' }}>
              <CardHeader
                avatar={<EyeIcon />}
                title="Heuristic Analysis"
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {analysisResult && (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip size="small" label={`Words: ${analysisResult.metrics.wordCount}`} />
                    <Chip size="small" label={`Headings: ${analysisResult.metrics.headingCount}`} />
                    <Chip size="small" label={`Links: ${analysisResult.metrics.linkCount}`} />
                    <Chip size="small" label={`Buttons: ${analysisResult.metrics.buttonCount}`} />
                    <Chip size="small" label={`Images: ${analysisResult.metrics.imgCount}`} />
                    <Chip size="small" label={`Missing alt: ${analysisResult.metrics.imgMissingAltCount}`} />
                  </Stack>
                )}

                {analysisResult?.warnings.length ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Warnings</Typography>
                    <Box component="ul" sx={{ pl: 3, m: 0 }}>
                      {analysisResult.warnings.map((warning) => (
                        <li key={warning}>
                          <Typography variant="body2">{warning}</Typography>
                        </li>
                      ))}
                    </Box>
                  </Box>
                ) : null}

                <Typography
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem',
                  }}
                >
                  {analysisReport}
                </Typography>
              </CardContent>
            </Card>
          )}

          {screenshotData && (
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" gutterBottom>Screenshot Preview</Typography>
              <Box sx={{ maxHeight: 384, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Box component="img" src={screenshotData} alt="Page screenshot" sx={{ width: '100%' }} />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Page Information" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">Title:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{document.title}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">URL:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {typeof window !== 'undefined' ? window.location.href : ''}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">Viewport:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {typeof window !== 'undefined' ? `${window.innerWidth} × ${window.innerHeight}` : ''}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">User Agent:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : ''}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
