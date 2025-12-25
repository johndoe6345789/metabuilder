import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Typography,
  Grid,
} from '@mui/material'
import {
  CameraAlt as CameraIcon,
  Visibility as EyeIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { toast } from 'sonner'

export function ScreenshotAnalyzer() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [screenshotData, setScreenshotData] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const captureScreenshot = async () => {
    setIsCapturing(true)
    try {
      toast.info('Capturing screenshot...')
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
      
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      const response = await fetch(window.location.href)
      const blob = await response.blob()
      const dataUrl = canvas.toDataURL('image/png')
      
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
      const bodyContent = document.body.innerText.substring(0, 3000)
      const htmlStructure = document.body.innerHTML.substring(0, 2000)
      
      // TODO: Replace with Next.js API route that calls an LLM service
      const placeholderAnalysis = `**Screenshot Analysis Feature Unavailable**\n\nThe AI-powered screenshot analysis feature is currently being migrated to work with Next.js. This will be available soon.\n\n**Page**: ${document.title}\n**URL**: ${window.location.href}\n**Viewport**: ${window.innerWidth}x${window.innerHeight}`
      
      // Original Spark LLM code (commented out):
      // const prompt = spark.llmPrompt`Analyze this webpage and provide a detailed assessment:
      // 
      // Page Title: ${document.title}
      // URL: ${window.location.href}
      // Viewport: ${window.innerWidth}x${window.innerHeight}
      // 
      // Body Text Preview (first 3000 chars):
      // ${bodyContent}
      // 
      // HTML Structure Preview (first 2000 chars):
      // ${htmlStructure}
      // 
      // Please provide:
      // 1. A summary of what this page does
      // 2. Key UI elements visible
      // 3. Any potential issues or improvements
      // 4. Overall assessment of the design and functionality`
      // 
      // const result = await spark.llm(prompt)
      // setAnalysis(result)
      
      setAnalysis(placeholderAnalysis)
      toast.info('Analysis feature temporarily disabled during migration')
    } catch (error) {
      console.error('Error analyzing:', error)
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
        <Chip label="AI-Powered" color="secondary" />
      </Box>

      <Card>
        <CardHeader
          title="Capture & Analyze"
          subheader="Take a screenshot and get AI-powered insights"
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
              <Typography color="text.secondary">Analyzing with AI...</Typography>
            </Box>
          )}

          {analysis && !isAnalyzing && (
            <Card variant="outlined" sx={{ bgcolor: 'action.hover' }}>
              <CardHeader
                avatar={<EyeIcon />}
                title="AI Analysis"
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <CardContent>
                <Typography 
                  component="pre" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'inherit',
                    fontSize: '0.875rem',
                  }}
                >
                  {analysis}
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
