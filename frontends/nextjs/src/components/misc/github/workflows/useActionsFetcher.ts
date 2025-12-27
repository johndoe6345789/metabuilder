import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { formatWorkflowRunAnalysis, summarizeWorkflowRuns } from '@/lib/github/analyze-workflow-runs'

import { useWorkflowLogAnalysis } from '../hooks/useWorkflowLogAnalysis'
import { useWorkflowRuns } from './hooks/useWorkflowRuns'

export function useActionsFetcher() {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'runs' | 'logs' | 'analysis'>('runs')

  const workflowRuns = useWorkflowRuns()

  const workflowLogAnalysis = useWorkflowLogAnalysis({
    repoInfo: workflowRuns.repoInfo,
    onAnalysisStart: () => setIsAnalyzing(true),
    onAnalysisComplete: (report) => {
      if (report) {
        setAnalysis(report)
      }
      setIsAnalyzing(false)
    },
  })

  const downloadWorkflowData = useCallback(() => {
    if (!workflowRuns.runs) return

    const jsonData = JSON.stringify(workflowRuns.runs, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `github-actions-${new Date().toISOString()}.json`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    toast.success('Downloaded workflow data')
  }, [workflowRuns.runs])

  const analyzeWorkflows = useCallback(async () => {
    if (!workflowRuns.runs || workflowRuns.runs.length === 0) {
      toast.error('No data to analyze')
      return
    }

    setIsAnalyzing(true)
    try {
      const summary = summarizeWorkflowRuns(workflowRuns.runs)
      const report = formatWorkflowRunAnalysis(summary)
      setAnalysis(report)
      toast.success('Analysis complete')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      toast.error(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }, [workflowRuns.runs])

  const analyzeLogs = useCallback(() => {
    workflowLogAnalysis.analyzeRunLogs(workflowRuns.runs)
  }, [workflowLogAnalysis, workflowRuns.runs])

  useEffect(() => {
    if (workflowLogAnalysis.runLogs && activeTab === 'runs') {
      setActiveTab('logs')
    }
  }, [activeTab, workflowLogAnalysis.runLogs])

  return {
    ...workflowRuns,
    ...workflowLogAnalysis,
    analysis,
    isAnalyzing,
    activeTab,
    setActiveTab,
    analyzeLogs,
    analyzeWorkflows,
    downloadWorkflowData,
  }
}
