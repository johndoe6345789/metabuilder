import { useState } from 'react'
import { analyzeErrorWithAI } from '../analyzeError'
import { useTranslation } from '@/hooks/useTranslation'

export function useAIErrorHelper(
  error: Error | string,
  context?: string,
) {
  const t = useTranslation()
  const [open, setOpen] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')

  const errorMessage =
    typeof error === 'string' ? error : error.message
  const errorStack =
    typeof error === 'string' ? '' : error.stack

  const analyzeError = async () => {
    setOpen(true)
    setIsAnalyzing(true)
    setAnalysisError('')
    setAnalysis('')
    try {
      const result = await analyzeErrorWithAI(
        errorMessage,
        errorStack,
        context,
      )
      setAnalysis(result)
    } catch (err) {
      console.error('AI analysis failed', err)
      setAnalysisError(t.aiErrorHelper.analysisError)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return {
    t,
    open,
    setOpen,
    analysis,
    isAnalyzing,
    analysisError,
    errorMessage,
    analyzeError,
  }
}
