import { Stack } from '@mui/material'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'

import { useActionsFetcher } from './workflows/useActionsFetcher'
import { AnalysisPanel } from './views/AnalysisPanel'
import { RunDetails } from './views/RunDetails'
import { RunList } from './views/RunList'

export function GitHubActionsFetcher() {
  const {
    runs,
    isLoading,
    error,
    needsAuth,
    repoLabel,
    lastFetched,
    autoRefreshEnabled,
    secondsUntilRefresh,
    toggleAutoRefresh,
    downloadWorkflowData,
    fetchRuns,
    getStatusColor,
    isLoadingLogs,
    conclusion,
    summaryTone,
    selectedRunId,
    runLogs,
    runJobs,
    analyzeLogs,
    analyzeWorkflows,
    downloadRunLogs,
    analysis,
    isAnalyzing,
    activeTab,
    setActiveTab,
  } = useActionsFetcher()

  return (
    <Stack spacing={3}>
      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as typeof activeTab)}>
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
              onAnalyzeLogs={analyzeLogs}
              isAnalyzing={isAnalyzing}
            />
          </TabsContent>
        )}

        <TabsContent value="analysis" sx={{ mt: 2 }}>
          <AnalysisPanel
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            runLogs={runLogs}
            onAnalyzeLogs={analyzeLogs}
            onAnalyzeWorkflows={analyzeWorkflows}
          />
        </TabsContent>
      </Tabs>
    </Stack>
  )
}
