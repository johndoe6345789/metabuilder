import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Eye, Download, ArrowsClockwise } from '@phosphor-icons/react'
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Screenshot Analyzer</h1>
          <p className="text-muted-foreground">Capture and analyze the current page</p>
        </div>
        <Badge variant="secondary">AI-Powered</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capture & Analyze</CardTitle>
          <CardDescription>Take a screenshot and get AI-powered insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={captureScreenshot}
              disabled={isCapturing || isAnalyzing}
              className="flex-1"
            >
              <Camera className="mr-2" />
              {isCapturing ? 'Capturing...' : 'Capture & Analyze'}
            </Button>
            
            {screenshotData && (
              <>
                <Button 
                  onClick={downloadScreenshot}
                  variant="outline"
                >
                  <Download className="mr-2" />
                  Download
                </Button>
                
                <Button 
                  onClick={analyzeScreenshot}
                  variant="outline"
                  disabled={isAnalyzing}
                >
                  <ArrowsClockwise className="mr-2" />
                  Re-analyze
                </Button>
              </>
            )}
          </div>

          {isAnalyzing && (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                <span className="text-muted-foreground">Analyzing with AI...</span>
              </div>
            </div>
          )}

          {analysis && !isAnalyzing && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {analysis}
                </div>
              </CardContent>
            </Card>
          )}

          {screenshotData && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="font-semibold mb-3">Screenshot Preview</h3>
              <div className="relative max-h-96 overflow-auto border rounded">
                <img 
                  src={screenshotData} 
                  alt="Page screenshot" 
                  className="w-full"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Page Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Title:</span>
              <p className="font-mono text-sm">{document.title}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">URL:</span>
              <p className="font-mono text-sm truncate">{window.location.href}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Viewport:</span>
              <p className="font-mono text-sm">{window.innerWidth} × {window.innerHeight}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">User Agent:</span>
              <p className="font-mono text-sm truncate">{navigator.userAgent.substring(0, 50)}...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
