import { useEffect, useMemo, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Autorenew as RunningIcon,
  Cancel as FailureIcon,
  CheckCircle as SuccessIcon,
  Description as FileTextIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  SmartToy as RobotIcon,
  TrendingDown as TrendDownIcon,
  TrendingUp as TrendUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { toast } from 'sonner'
import { formatWorkflowRunAnalysis, summarizeWorkflowRuns } from '@/lib/github/analyze-workflow-runs'
import { formatWorkflowLogAnalysis, summarizeWorkflowLogs } from '@/lib/github/analyze-workflow-logs'

interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  created_at: string
  updated_at: string
  html_url: string
  head_branch: string
  event: string
  jobs_url?: string
}

interface Job {
  id: number
  name: string
  status: string
  conclusion: string | null
  started_at: string
  completed_at: string | null
  steps: JobStep[]
}

interface JobStep {
  name: string
  status: string
  conclusion: string | null
  number: number
  started_at?: string | null
  completed_at?: string | null
}

const spinSx = {
  animation: 'spin 1s linear infinite',
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
}

const pulseSx = {
  animation: 'pulse 1.4s ease-in-out infinite',
  '@keyframes pulse': {
    '0%, 100%': { opacity: 0.6 },
    '50%': { opacity: 1 },
  },
}

export function GitHubActionsFetcher() {
  const [data, setData] = useState<WorkflowRun[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string } | null>(null)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null)
  const [runJobs, setRunJobs] = useState<Job[]>([])
  const [runLogs, setRunLogs] = useState<string | null>(null)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const repoLabel = repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : 'johndoe6345789/metabuilder'

  const fetchGitHubActions = async () => {
    setIsLoading(true)
    setError(null)
    setNeedsAuth(false)

    try {
      const response = await fetch('/api/github/actions/runs', { cache: 'no-store' })
      let payload: {
        owner?: string
        repo?: string
        runs?: WorkflowRun[]
        fetchedAt?: string
        requiresAuth?: boolean
        error?: string
      } | null = null

      try {
        payload = await response.json()
      } catch {
        payload = null
      }

      if (!response.ok) {
        if (payload?.requiresAuth) {
          setNeedsAuth(true)
        }
        const message = payload?.error || `Failed to fetch workflow runs (${response.status})`
        throw new Error(message)
      }

      const runs = payload?.runs || []
      setData(runs)
      if (payload?.owner && payload?.repo) {
        setRepoInfo({ owner: payload.owner, repo: payload.repo })
      }
      setLastFetched(payload?.fetchedAt ? new Date(payload.fetchedAt) : new Date())
      setSecondsUntilRefresh(30)
      toast.success(`Fetched ${runs.length} workflow runs`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      toast.error(`Failed to fetch: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGitHubActions()
  }, [])

  useEffect(() => {
    if (!autoRefreshEnabled) return

    const countdownInterval = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          fetchGitHubActions()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [autoRefreshEnabled])

  const getStatusColor = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      if (conclusion === 'success') return 'success.main'
      if (conclusion === 'failure') return 'error.main'
      if (conclusion === 'cancelled') return 'text.secondary'
    }
    return 'warning.main'
  }

  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      if (conclusion === 'success') {
        return <SuccessIcon sx={{ color: 'success.main', fontSize: 20 }} />
      }
      if (conclusion === 'failure') {
        return <FailureIcon sx={{ color: 'error.main', fontSize: 20 }} />
      }
      if (conclusion === 'cancelled') {
        return <FailureIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
      }
    }

    return <RunningIcon sx={{ color: 'warning.main', fontSize: 20, ...spinSx }} />
  }

  const analyzeWorkflows = async () => {
    if (!data || data.length === 0) {
      toast.error('No data to analyze')
      return
    }

    setIsAnalyzing(true)
    try {
      const summary = summarizeWorkflowRuns(data)
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

  const downloadWorkflowData = () => {
    if (!data) return

    const jsonData = JSON.stringify(data, null, 2)
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

  const downloadRunLogs = async (runId: number, runName: string) => {
    setIsLoadingLogs(true)
    setSelectedRunId(runId)
    setRunLogs(null)
    setRunJobs([])

    try {
      const query = new URLSearchParams({
        runName,
        includeLogs: 'true',
        jobLimit: '20',
      })
      if (repoInfo) {
        query.set('owner', repoInfo.owner)
        query.set('repo', repoInfo.repo)
      }

      const response = await fetch(`/api/github/actions/runs/${runId}/logs?${query.toString()}`, {
        cache: 'no-store',
      })

      let payload: {
        jobs?: Job[]
        logsText?: string | null
        truncated?: boolean
        requiresAuth?: boolean
        error?: string
      } | null = null

      try {
        payload = await response.json()
      } catch {
        payload = null
      }

      if (!response.ok) {
        if (payload?.requiresAuth) {
          toast.error('GitHub API requires authentication for logs')
        }
        const message = payload?.error || `Failed to download logs (${response.status})`
        throw new Error(message)
      }

      const logsText = payload?.logsText ?? null
      setRunJobs(payload?.jobs ?? [])
      setRunLogs(logsText)

      if (logsText) {
        const blob = new Blob([logsText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `workflow-logs-${runId}-${new Date().toISOString()}.txt`
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(url)
      }

      if (payload?.truncated) {
        toast.info('Downloaded logs are truncated. Increase the job limit for more.')
      }

      toast.success('Workflow logs downloaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download logs'
      toast.error(errorMessage)
      setRunLogs(`Error fetching logs: ${errorMessage}`)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const analyzeRunLogs = async () => {
    if (!runLogs || !selectedRunId) {
      toast.error('No logs to analyze')
      return
    }

    setIsAnalyzing(true)
    try {
      const selectedRun = data?.find(r => r.id === selectedRunId)
      const summary = summarizeWorkflowLogs(runLogs)
      const report = formatWorkflowLogAnalysis(summary, {
        runName: selectedRun?.name,
        runId: selectedRunId,
      })
      setAnalysis(report)
      toast.success('Log analysis complete')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      toast.error(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const conclusion = useMemo(() => {
    if (!data || data.length === 0) return null

    const total = data.length
    const completed = data.filter(r => r.status === 'completed').length
    const successful = data.filter(r => r.status === 'completed' && r.conclusion === 'success').length
    const failed = data.filter(r => r.status === 'completed' && r.conclusion === 'failure').length
    const cancelled = data.filter(r => r.status === 'completed' && r.conclusion === 'cancelled').length
    const inProgress = data.filter(r => r.status !== 'completed').length

    const mostRecent = data[0]
    const mostRecentTimestamp = new Date(mostRecent.updated_at).getTime()
    const timeThreshold = 5 * 60 * 1000

    const recentWorkflows = data.filter(r => {
      const runTime = new Date(r.updated_at).getTime()
      return Math.abs(runTime - mostRecentTimestamp) < timeThreshold
    })

    const hasAnyFailed = recentWorkflows.some(r => r.status === 'completed' && r.conclusion === 'failure')
    const hasAnyRunning = recentWorkflows.some(r => r.status !== 'completed')
    const allPassed = recentWorkflows.every(r => r.status === 'completed' && r.conclusion === 'success')

    const mostRecentPassed = allPassed && recentWorkflows.length > 0
    const mostRecentFailed = hasAnyFailed
    const mostRecentRunning = hasAnyRunning && !hasAnyFailed

    const successRate = completed > 0 ? Math.round((successful / completed) * 100) : 0
    const recentRuns = data.slice(0, 5)
    const recentCompleted = recentRuns.filter(r => r.status === 'completed')
    const recentSuccessful = recentCompleted.filter(r => r.conclusion === 'success').length
    const recentFailed = recentCompleted.filter(r => r.conclusion === 'failure').length

    const health = successRate >= 80 ? 'healthy' : successRate >= 60 ? 'warning' : 'critical'
    const trend = recentSuccessful >= recentFailed ? 'up' : 'down'

    return {
      total,
      completed,
      successful,
      failed,
      cancelled,
      inProgress,
      successRate,
      health,
      trend,
      recentSuccessful,
      recentFailed,
      mostRecent,
      mostRecentPassed,
      mostRecentFailed,
      mostRecentRunning,
      recentWorkflows,
    }
  }, [data])

  const summaryTone = conclusion
    ? conclusion.mostRecentPassed
      ? 'success'
      : conclusion.mostRecentFailed
      ? 'error'
      : 'warning'
    : 'warning'

  return (
    <Stack spacing={3} sx={{ py: 3 }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', lg: 'center' }}
        justifyContent="space-between"
      >
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            GitHub Actions Monitor
          </Typography>
          <Typography color="text.secondary">
            Repository:{' '}
            <Box
              component="code"
              sx={{
                ml: 1,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'action.hover',
                fontSize: '0.875rem',
              }}
            >
              {repoLabel}
            </Box>
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Button
            onClick={downloadWorkflowData}
            disabled={!data || data.length === 0}
            variant="outline"
            size="sm"
            startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
          >
            Download JSON
          </Button>

          <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Badge
                variant={autoRefreshEnabled ? 'default' : 'outline'}
                sx={{ fontSize: '0.75rem' }}
              >
                Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}
              </Badge>
              {autoRefreshEnabled && (
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  Next refresh: {secondsUntilRefresh}s
                </Typography>
              )}
            </Stack>
            <Button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              variant="outline"
              size="sm"
            >
              {autoRefreshEnabled ? 'Disable' : 'Enable'} Auto-refresh
            </Button>
          </Stack>

          <Button
            onClick={fetchGitHubActions}
            disabled={isLoading}
            size="lg"
            startIcon={<RefreshIcon sx={isLoading ? spinSx : undefined} />}
          >
            {isLoading ? 'Fetching...' : 'Refresh'}
          </Button>
        </Stack>
      </Stack>

      {conclusion && (
        <>
          <Alert
            sx={(theme) => ({
              borderWidth: 2,
              borderColor: theme.palette[summaryTone].main,
              bgcolor: alpha(theme.palette[summaryTone].main, 0.08),
              alignItems: 'flex-start',
            })}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start">
              {summaryTone === 'success' && (
                <SuccessIcon sx={{ color: 'success.main', fontSize: 48 }} />
              )}
              {summaryTone === 'error' && (
                <FailureIcon sx={{ color: 'error.main', fontSize: 48 }} />
              )}
              {summaryTone === 'warning' && (
                <RunningIcon sx={{ color: 'warning.main', fontSize: 48, ...spinSx }} />
              )}
              <Box flex={1}>
                <AlertTitle>
                  <Box sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 1 }}>
                    {conclusion.mostRecentPassed && 'Most Recent Builds: ALL PASSED'}
                    {conclusion.mostRecentFailed && 'Most Recent Builds: FAILURES DETECTED'}
                    {conclusion.mostRecentRunning && 'Most Recent Builds: RUNNING'}
                  </Box>
                </AlertTitle>
                <AlertDescription>
                  <Stack spacing={2}>
                    <Typography variant="body2">
                      {conclusion.recentWorkflows.length > 1
                        ? `Showing ${conclusion.recentWorkflows.length} workflows from the most recent run:`
                        : 'Most recent workflow:'}
                    </Typography>
                    <Stack spacing={1.5}>
                      {conclusion.recentWorkflows.map((workflow) => {
                        const statusLabel = workflow.status === 'completed'
                          ? workflow.conclusion
                          : workflow.status
                        const badgeVariant = workflow.conclusion === 'success'
                          ? 'default'
                          : workflow.conclusion === 'failure'
                          ? 'destructive'
                          : 'outline'

                        return (
                          <Box
                            key={workflow.id}
                            sx={{
                              bgcolor: 'background.paper',
                              borderRadius: 2,
                              p: 2,
                              boxShadow: 1,
                            }}
                          >
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {workflow.status === 'completed' && workflow.conclusion === 'success' && (
                                  <SuccessIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                )}
                                {workflow.status === 'completed' && workflow.conclusion === 'failure' && (
                                  <FailureIcon sx={{ color: 'error.main', fontSize: 20 }} />
                                )}
                                {workflow.status !== 'completed' && (
                                  <RunningIcon sx={{ color: 'warning.main', fontSize: 20, ...spinSx }} />
                                )}
                                <Typography fontWeight={600}>{workflow.name}</Typography>
                                <Badge variant={badgeVariant} sx={{ fontSize: '0.75rem' }}>
                                  {statusLabel}
                                </Badge>
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={2}
                                flexWrap="wrap"
                                sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                              >
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Typography fontWeight={600}>Branch:</Typography>
                                  <Box
                                    component="code"
                                    sx={{
                                      px: 0.75,
                                      py: 0.25,
                                      bgcolor: 'action.hover',
                                      borderRadius: 1,
                                      fontFamily: 'monospace',
                                    }}
                                  >
                                    {workflow.head_branch}
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Typography fontWeight={600}>Updated:</Typography>
                                  <Typography>{new Date(workflow.updated_at).toLocaleString()}</Typography>
                                </Stack>
                              </Stack>
                            </Stack>
                          </Box>
                        )
                      })}
                    </Stack>
                    <Box>
                      <Button
                        variant={conclusion.mostRecentPassed ? 'default' : 'destructive'}
                        size="sm"
                        component="a"
                        href="https://github.com/johndoe6345789/metabuilder/actions"
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 18 }} />}
                      >
                        View All Workflows on GitHub
                      </Button>
                    </Box>
                  </Stack>
                </AlertDescription>
              </Box>
            </Stack>
          </Alert>

          <Card sx={{ borderWidth: 2, borderColor: 'divider' }}>
            <CardHeader>
              <Stack direction="row" spacing={1} alignItems="center">
                {conclusion.health === 'healthy' && (
                  <SuccessIcon sx={{ color: 'success.main', fontSize: 24 }} />
                )}
                {conclusion.health === 'warning' && (
                  <WarningIcon sx={{ color: 'warning.main', fontSize: 24 }} />
                )}
                {conclusion.health === 'critical' && (
                  <FailureIcon sx={{ color: 'error.main', fontSize: 24 }} />
                )}
                <CardTitle>Pipeline Health Summary</CardTitle>
              </Stack>
              <CardDescription>Analysis of recent workflow runs</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Badge
                    variant={
                      conclusion.health === 'healthy'
                        ? 'default'
                        : conclusion.health === 'warning'
                        ? 'outline'
                        : 'destructive'
                    }
                    sx={{ fontSize: '0.875rem', px: 1.5, py: 0.5 }}
                  >
                    {conclusion.successRate}% Success Rate
                  </Badge>

                  <Badge variant="secondary" sx={{ fontSize: '0.875rem', px: 1.5, py: 0.5 }}>
                    <SuccessIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    {conclusion.successful} Passed
                  </Badge>

                  {conclusion.failed > 0 && (
                    <Badge variant="destructive" sx={{ fontSize: '0.875rem', px: 1.5, py: 0.5 }}>
                      <FailureIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      {conclusion.failed} Failed
                    </Badge>
                  )}

                  {conclusion.inProgress > 0 && (
                    <Badge variant="outline" sx={{ fontSize: '0.875rem', px: 1.5, py: 0.5 }}>
                      <RunningIcon sx={{ fontSize: 14, mr: 0.5, ...spinSx }} />
                      {conclusion.inProgress} Running
                    </Badge>
                  )}

                  {conclusion.cancelled > 0 && (
                    <Badge
                      variant="outline"
                      sx={{ fontSize: '0.875rem', px: 1.5, py: 0.5, opacity: 0.7 }}
                    >
                      {conclusion.cancelled} Cancelled
                    </Badge>
                  )}

                  <Badge
                    variant={conclusion.trend === 'up' ? 'default' : 'destructive'}
                    sx={{ fontSize: '0.875rem', px: 1.5, py: 0.5 }}
                  >
                    {conclusion.trend === 'up' ? (
                      <TrendUpIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    ) : (
                      <TrendDownIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    )}
                    Recent: {conclusion.recentSuccessful}/{conclusion.recentSuccessful + conclusion.recentFailed}
                  </Badge>
                </Stack>

                <Stack spacing={1} sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  {conclusion.health === 'healthy' && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SuccessIcon sx={{ color: 'success.main', fontSize: 18 }} />
                      <Typography variant="body2">
                        Pipeline is healthy. Most recent runs are passing consistently.
                      </Typography>
                    </Stack>
                  )}
                  {conclusion.health === 'warning' && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WarningIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                      <Typography variant="body2">
                        Pipeline health is moderate. Some failures detected in recent runs.
                      </Typography>
                    </Stack>
                  )}
                  {conclusion.health === 'critical' && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FailureIcon sx={{ color: 'error.main', fontSize: 18 }} />
                      <Typography variant="body2">
                        Pipeline health is critical. High failure rate detected.
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </>
      )}

      {needsAuth && (
        <Alert>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <InfoIcon sx={{ color: 'info.main', fontSize: 20 }} />
            <Box>
              <AlertTitle>Authentication Note</AlertTitle>
              <AlertDescription>
                This app uses the GitHub API to fetch workflow data. The public API allows anonymous access with rate
                limits.
              </AlertDescription>
            </Box>
          </Stack>
        </Alert>
      )}

      {lastFetched && (
        <Alert>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <SuccessIcon sx={{ color: 'success.main', fontSize: 20 }} />
            <Box>
              <AlertTitle>Last Fetched</AlertTitle>
              <AlertDescription>{lastFetched.toLocaleString()}</AlertDescription>
            </Box>
          </Stack>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <FailureIcon sx={{ fontSize: 20 }} />
            <Box>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Stack>
        </Alert>
      )}

      <Tabs defaultValue="workflows" sx={{ gap: 2 }}>
        <TabsList>
          <TabsTrigger value="workflows">Workflow Runs</TabsTrigger>
          {runLogs && <TabsTrigger value="logs">Downloaded Logs</TabsTrigger>}
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" sx={{ mt: 2 }}>
          <Card>
            <CardHeader>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <CardTitle>Workflow Runs</CardTitle>
                <Button
                  variant="link"
                  size="sm"
                  component="a"
                  href="https://github.com/johndoe6345789/metabuilder/actions"
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                >
                  Open in GitHub
                </Button>
              </Stack>
              <CardDescription>Recent workflow runs via GitHub REST API</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Stack spacing={2}>
                  <Skeleton sx={{ height: 80 }} />
                  <Skeleton sx={{ height: 80 }} />
                  <Skeleton sx={{ height: 80 }} />
                  <Skeleton sx={{ height: 80 }} />
                </Stack>
              ) : data && data.length > 0 ? (
                <Stack spacing={2}>
                  {data.map((run) => {
                    const isRunLoading = isLoadingLogs && selectedRunId === run.id
                    const borderColor = run.conclusion === 'success'
                      ? 'success.main'
                      : run.conclusion === 'failure'
                      ? 'error.main'
                      : 'warning.main'

                    return (
                      <Card
                        key={run.id}
                        sx={{
                          borderLeftWidth: 4,
                          borderLeftStyle: 'solid',
                          borderLeftColor: borderColor,
                        }}
                      >
                        <CardContent>
                          <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={2}
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                            justifyContent="space-between"
                          >
                            <Box flex={1} minWidth={0}>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                {getStatusIcon(run.status, run.conclusion)}
                                <Typography variant="subtitle1" fontWeight={600} noWrap>
                                  {run.name}
                                </Typography>
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={2}
                                flexWrap="wrap"
                                sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                              >
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Typography fontWeight={600}>Branch:</Typography>
                                  <Box
                                    component="code"
                                    sx={{
                                      px: 0.75,
                                      py: 0.25,
                                      borderRadius: 1,
                                      bgcolor: 'action.hover',
                                      fontFamily: 'monospace',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    {run.head_branch}
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Typography fontWeight={600}>Event:</Typography>
                                  <Typography>{run.event}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Typography fontWeight={600}>Status:</Typography>
                                  <Typography sx={{ color: getStatusColor(run.status, run.conclusion) }}>
                                    {run.status === 'completed' ? run.conclusion : run.status}
                                  </Typography>
                                </Stack>
                              </Stack>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Updated: {new Date(run.updated_at).toLocaleString()}
                              </Typography>
                            </Box>

                            <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadRunLogs(run.id, run.name)}
                                disabled={isRunLoading}
                                startIcon={
                                  isRunLoading
                                    ? <RunningIcon sx={{ fontSize: 16, ...spinSx }} />
                                    : <DownloadIcon sx={{ fontSize: 16 }} />
                                }
                              >
                                {isRunLoading ? 'Loading...' : 'Download Logs'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                component="a"
                                href={run.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                              >
                                View
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    )
                  })}
                  <Box sx={{ textAlign: 'center', pt: 2 }}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const jsonData = JSON.stringify(data, null, 2)
                        navigator.clipboard.writeText(jsonData)
                        toast.success('JSON data copied to clipboard')
                      }}
                    >
                      Copy All as JSON
                    </Button>
                  </Box>
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                  No workflow runs found. Click refresh to fetch data.
                </Box>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {runLogs && (
          <TabsContent value="logs" sx={{ mt: 2 }}>
            <Card>
              <CardHeader>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FileTextIcon sx={{ fontSize: 24 }} />
                  <CardTitle>Workflow Logs</CardTitle>
                  {selectedRunId && (
                    <Badge variant="secondary" sx={{ fontSize: '0.75rem' }}>
                      Run #{selectedRunId}
                    </Badge>
                  )}
                </Stack>
                <CardDescription>
                  Complete logs from workflow run including all jobs and steps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Stack spacing={3}>
                  {runJobs.length > 0 && (
                    <Stack spacing={1.5}>
                      <Typography variant="subtitle2">Jobs Summary</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {runJobs.map((job) => (
                          <Badge
                            key={job.id}
                            variant={
                              job.conclusion === 'success'
                                ? 'default'
                                : job.conclusion === 'failure'
                                ? 'destructive'
                                : 'outline'
                            }
                            sx={{ fontSize: '0.75rem' }}
                          >
                            {job.name}: {job.conclusion || job.status}
                          </Badge>
                        ))}
                      </Stack>
                    </Stack>
                  )}

                  <ScrollArea
                    sx={{
                      height: 600,
                      width: '100%',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 2,
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {runLogs}
                    </Box>
                  </ScrollArea>

                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(runLogs)
                        toast.success('Logs copied to clipboard')
                      }}
                      variant="outline"
                    >
                      Copy to Clipboard
                    </Button>
                    <Button
                      onClick={analyzeRunLogs}
                      disabled={isAnalyzing}
                      startIcon={<RobotIcon sx={isAnalyzing ? pulseSx : undefined} />}
                    >
                      {isAnalyzing ? 'Analyzing Logs...' : 'Analyze Logs with AI'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="analysis" sx={{ mt: 2 }}>
          <Card>
            <CardHeader>
              <Stack direction="row" spacing={1} alignItems="center">
                <RobotIcon sx={{ fontSize: 24 }} />
                <CardTitle>AI-Powered Workflow Analysis</CardTitle>
              </Stack>
              <CardDescription>
                {runLogs
                  ? 'Deep analysis of downloaded workflow logs using GPT-4'
                  : 'Deep analysis of your CI/CD pipeline using GPT-4'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Stack spacing={3}>
                {runLogs ? (
                  <Button
                    onClick={analyzeRunLogs}
                    disabled={isAnalyzing}
                    size="lg"
                    fullWidth
                    startIcon={<RobotIcon sx={isAnalyzing ? pulseSx : undefined} />}
                  >
                    {isAnalyzing ? 'Analyzing Logs...' : 'Analyze Downloaded Logs with AI'}
                  </Button>
                ) : (
                  <Button
                    onClick={analyzeWorkflows}
                    disabled={isAnalyzing || !data || data.length === 0}
                    size="lg"
                    fullWidth
                    startIcon={<RobotIcon sx={isAnalyzing ? pulseSx : undefined} />}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Workflows with AI'}
                  </Button>
                )}

                {isAnalyzing && (
                  <Stack spacing={2}>
                    <Skeleton sx={{ height: 128 }} />
                    <Skeleton sx={{ height: 128 }} />
                    <Skeleton sx={{ height: 128 }} />
                  </Stack>
                )}

                {analysis && !isAnalyzing && (
                  <Box
                    sx={{
                      bgcolor: 'action.hover',
                      p: 3,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {analysis}
                  </Box>
                )}

                {!analysis && !isAnalyzing && (
                  <Alert>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <InfoIcon sx={{ color: 'info.main', fontSize: 20 }} />
                      <Box>
                        <AlertTitle>No Analysis Yet</AlertTitle>
                        <AlertDescription>
                          {runLogs
                            ? 'Click the button above to run an AI analysis of the downloaded logs. The AI will identify errors, provide root cause analysis, and suggest fixes.'
                            : 'Download logs from a specific workflow run using the "Download Logs" button, or click above to analyze overall workflow patterns.'}
                        </AlertDescription>
                      </Box>
                    </Stack>
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Stack>
  )
}
