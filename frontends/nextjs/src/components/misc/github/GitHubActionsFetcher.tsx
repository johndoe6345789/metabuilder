import { useEffect, useState } from 'react'
import { Stack } from '@mui/material'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { formatWorkflowRunAnalysis, summarizeWorkflowRuns } from '@/lib/github/analyze-workflow-runs'
import { toast } from 'sonner'

import { useWorkflowRuns } from './hooks/useWorkflowRuns'
import { useWorkflowLogAnalysis } from './hooks/useWorkflowLogAnalysis'
import { AnalysisPanel } from './views/AnalysisPanel'
import { RunDetails } from './views/RunDetails'
import { RunList } from './views/RunList'

export function GitHubActionsFetcher() {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'runs' | 'logs' | 'analysis'>(
    'runs',
  )

  const {
    runs,
    isLoading,
    error,
    needsAuth,
    repoInfo,
    repoLabel,
    lastFetched,
    secondsUntilRefresh,
    autoRefreshEnabled,
    toggleAutoRefresh,
    fetchRuns,
    getStatusColor,
    conclusion,
    summaryTone,
  } = useWorkflowRuns()

  const {
    analyzeRunLogs,
    downloadRunLogs,
    isLoadingLogs,
    runJobs,
    runLogs,
    selectedRunId,
  } = useWorkflowLogAnalysis({
    repoInfo,
    onAnalysisStart: () => setIsAnalyzing(true),
    onAnalysisComplete: (report) => {
      if (report) {
        setAnalysis(report)
      }
      setIsAnalyzing(false)
    },
  })

  const downloadWorkflowData = () => {
    if (!runs) return

    const jsonData = JSON.stringify(runs, null, 2)
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
  }

  const analyzeWorkflows = async () => {
    if (!runs || runs.length === 0) {
      toast.error('No data to analyze')
      return
    }

    setIsAnalyzing(true)
    try {
      const summary = summarizeWorkflowRuns(runs)
      const report = formatWorkflowRunAnalysis(summary)
      setAnalysis(report)
      toast.success('Analysis complete')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      toast.error(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalyzeLogs = () => analyzeRunLogs(runs)

  useEffect(() => {
    if (runLogs && activeTab === 'runs') {
      setActiveTab('logs')
    }
  }, [activeTab, runLogs])

  return (
    <Stack spacing={3}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="runs">Workflow Runs</TabsTrigger>
          {runLogs && <TabsTrigger value="logs">Logs</TabsTrigger>}
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" sx={{ mt: 2 }}>
          <RunList
            runs={runs}
            isLoading={isLoading}
            error={error}
            needsAuth={needsAuth}
            repoLabel={repoLabel}
            lastFetched={lastFetched}
            autoRefreshEnabled={autoRefreshEnabled}
            secondsUntilRefresh={secondsUntilRefresh}
            onToggleAutoRefresh={toggleAutoRefresh}
            onRefresh={fetchRuns}
            getStatusColor={getStatusColor}
            onDownloadLogs={downloadRunLogs}
            onDownloadJson={downloadWorkflowData}
            isLoadingLogs={isLoadingLogs}
            conclusion={conclusion}
            summaryTone={summaryTone}
            selectedRunId={selectedRunId}
          />
        </TabsContent>

        {runLogs && (
          <TabsContent value="logs" sx={{ mt: 2 }}>
            <RunDetails
              runLogs={runLogs}
              runJobs={runJobs}
              selectedRunId={selectedRunId}
              onAnalyzeLogs={handleAnalyzeLogs}
              isAnalyzing={isAnalyzing}
            />
          </TabsContent>
        )}

        <TabsContent value="analysis" sx={{ mt: 2 }}>
          <AnalysisPanel
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            runLogs={runLogs}
            onAnalyzeLogs={handleAnalyzeLogs}
            onAnalyzeWorkflows={analyzeWorkflows}
          />
        </TabsContent>
      </Tabs>
    </Stack>
  )
}
