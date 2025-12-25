import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { CheckCircle, XCircle, ArrowClockwise, ArrowSquareOut, Info, Warning, TrendUp, TrendDown, Robot, Download, FileText } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui'
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
      if (conclusion === 'success') return 'text-green-600'
      if (conclusion === 'failure') return 'text-red-600'
      if (conclusion === 'cancelled') return 'text-gray-600'
    }
    return 'text-yellow-600'
  }

  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === 'completed' && conclusion === 'success') {
      return <CheckCircle className="text-green-600" />
    }
    return <XCircle className="text-red-600" />
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
    const a = document.createElement('a')
    a.href = url
    a.download = `github-actions-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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
        const a = document.createElement('a')
        a.href = url
        a.download = `workflow-logs-${runId}-${new Date().toISOString()}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
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
      recentWorkflows
    }
  }, [data])

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">GitHub Actions Monitor</h2>
          <p className="text-muted-foreground mt-2">
            Repository: <code className="text-sm bg-muted px-2 py-1 rounded">johndoe6345789/metabuilder</code>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={downloadWorkflowData}
            disabled={!data || data.length === 0}
            variant="outline"
            size="sm"
          >
            <Download />
            Download JSON
          </Button>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <Badge variant={autoRefreshEnabled ? "default" : "outline"} className="text-xs">
                Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}
              </Badge>
              {autoRefreshEnabled && (
                <span className="text-xs text-muted-foreground font-mono">
                  Next refresh: {secondsUntilRefresh}s
                </span>
              )}
            </div>
            <Button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              variant="outline"
              size="sm"
            >
              {autoRefreshEnabled ? 'Disable' : 'Enable'} Auto-refresh
            </Button>
          </div>
          <Button
            onClick={fetchGitHubActions}
            disabled={isLoading}
            size="lg"
          >
            <ArrowClockwise className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Fetching...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {conclusion && (
        <>
          <Alert 
            className={`border-4 ${
              conclusion.mostRecentPassed 
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                : conclusion.mostRecentFailed
                ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
            }`}
          >
            <div className="flex items-start gap-4">
              {conclusion.mostRecentPassed && (
                <CheckCircle size={48} weight="fill" className="text-green-600 flex-shrink-0" />
              )}
              {conclusion.mostRecentFailed && (
                <XCircle size={48} weight="fill" className="text-red-600 flex-shrink-0" />
              )}
              {conclusion.mostRecentRunning && (
                <ArrowClockwise size={48} weight="bold" className="text-yellow-600 flex-shrink-0 animate-spin" />
              )}
              <div className="flex-1">
                <AlertTitle className="text-2xl font-bold mb-2">
                  {conclusion.mostRecentPassed && 'Most Recent Builds: ALL PASSED ✓'}
                  {conclusion.mostRecentFailed && 'Most Recent Builds: FAILURES DETECTED ✗'}
                  {conclusion.mostRecentRunning && 'Most Recent Builds: RUNNING...'}
                </AlertTitle>
                <AlertDescription className="space-y-3">
                  <div className="text-sm">
                    {conclusion.recentWorkflows.length > 1 ? (
                      <span>Showing {conclusion.recentWorkflows.length} workflows from the most recent run:</span>
                    ) : (
                      <span>Most recent workflow:</span>
                    )}
                  </div>
                  {conclusion.recentWorkflows.map((workflow) => (
                    <div key={workflow.id} className="bg-background/60 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        {workflow.status === 'completed' && workflow.conclusion === 'success' && (
                          <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                        )}
                        {workflow.status === 'completed' && workflow.conclusion === 'failure' && (
                          <XCircle size={20} className="text-red-600 flex-shrink-0" />
                        )}
                        {workflow.status !== 'completed' && (
                          <ArrowClockwise size={20} className="text-yellow-600 flex-shrink-0" />
                        )}
                        <span className="font-semibold">{workflow.name}</span>
                        <Badge variant={
                          workflow.conclusion === 'success' ? 'default' : 
                          workflow.conclusion === 'failure' ? 'destructive' : 
                          'outline'
                        } className="text-xs">
                          {workflow.status === 'completed' ? workflow.conclusion : workflow.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">Branch:</span>
                          <code className="bg-background px-1.5 py-0.5 rounded text-xs font-mono">
                            {workflow.head_branch}
                          </code>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">Updated:</span>
                          <span>{new Date(workflow.updated_at).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button
                      variant={conclusion.mostRecentPassed ? 'default' : 'destructive'}
                      size="sm"
                      asChild
                    >
                      <a
                        href="https://github.com/johndoe6345789/metabuilder/actions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        View All Workflows on GitHub
                        <ArrowSquareOut size={16} />
                      </a>
                    </Button>
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {conclusion.health === 'healthy' && <CheckCircle className="text-green-600" size={24} />}
                {conclusion.health === 'warning' && <Warning className="text-yellow-600" size={24} />}
                {conclusion.health === 'critical' && <XCircle className="text-red-600" size={24} />}
                Pipeline Health Summary
              </CardTitle>
              <CardDescription>
                Analysis of recent workflow runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={conclusion.health === 'healthy' ? 'default' : conclusion.health === 'warning' ? 'outline' : 'destructive'}
                    className="text-sm px-3 py-1"
                  >
                    {conclusion.successRate}% Success Rate
                  </Badge>
                  
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <CheckCircle size={14} className="mr-1" />
                    {conclusion.successful} Passed
                  </Badge>
                  
                  {conclusion.failed > 0 && (
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                      <XCircle size={14} className="mr-1" />
                      {conclusion.failed} Failed
                    </Badge>
                  )}
                  
                  {conclusion.inProgress > 0 && (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      <ArrowClockwise size={14} className="mr-1" />
                      {conclusion.inProgress} Running
                    </Badge>
                  )}
                  
                  {conclusion.cancelled > 0 && (
                    <Badge variant="outline" className="text-sm px-3 py-1 opacity-60">
                      {conclusion.cancelled} Cancelled
                    </Badge>
                  )}

                  <Badge 
                    variant={conclusion.trend === 'up' ? 'default' : 'destructive'}
                    className="text-sm px-3 py-1"
                  >
                    {conclusion.trend === 'up' ? (
                      <TrendUp size={14} className="mr-1" />
                    ) : (
                      <TrendDown size={14} className="mr-1" />
                    )}
                    Recent: {conclusion.recentSuccessful}/{conclusion.recentSuccessful + conclusion.recentFailed}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  {conclusion.health === 'healthy' && (
                    <p className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      Pipeline is healthy. Most recent runs are passing consistently.
                    </p>
                  )}
                  {conclusion.health === 'warning' && (
                    <p className="flex items-center gap-2">
                      <Warning size={16} className="text-yellow-600" />
                      Pipeline health is moderate. Some failures detected in recent runs.
                    </p>
                  )}
                  {conclusion.health === 'critical' && (
                    <p className="flex items-center gap-2">
                      <XCircle size={16} className="text-red-600" />
                      Pipeline health is critical. High failure rate detected.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {needsAuth && (
        <Alert>
          <Info className="text-blue-600" />
          <AlertTitle>Authentication Note</AlertTitle>
          <AlertDescription>
            This app uses the GitHub API to fetch workflow data. The public API allows anonymous access with rate limits.
          </AlertDescription>
        </Alert>
      )}

      {lastFetched && (
        <Alert>
          <CheckCircle className="text-green-600" />
          <AlertTitle>Last Fetched</AlertTitle>
          <AlertDescription>
            {lastFetched.toLocaleString()}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflow Runs</TabsTrigger>
          {runLogs && <TabsTrigger value="logs">Downloaded Logs</TabsTrigger>}
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Workflow Runs
                <a
                  href="https://github.com/johndoe6345789/metabuilder/actions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-normal text-primary hover:underline flex items-center gap-2"
                >
                  Open in GitHub
                  <ArrowSquareOut size={16} />
                </a>
              </CardTitle>
              <CardDescription>
                Recent workflow runs via GitHub REST API
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : data && data.length > 0 ? (
                <div className="space-y-3">
                  {data.map((run) => (
                    <Card key={run.id} className="border-l-4" style={{ borderLeftColor: run.conclusion === 'success' ? '#16a34a' : '#dc2626' }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(run.status, run.conclusion)}
                              <h3 className="font-semibold text-foreground truncate">{run.name}</h3>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Branch:</span>
                                <code className="bg-muted px-1 rounded text-xs">{run.head_branch}</code>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Event:</span>
                                <span>{run.event}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Status:</span>
                                <span className={getStatusColor(run.status, run.conclusion)}>
                                  {run.status === 'completed' ? run.conclusion : run.status}
                                </span>
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              Updated: {new Date(run.updated_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadRunLogs(run.id, run.name)}
                              disabled={isLoadingLogs && selectedRunId === run.id}
                            >
                              <Download size={14} />
                              {isLoadingLogs && selectedRunId === run.id ? 'Loading...' : 'Download Logs'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a
                                href={run.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                View
                                <ArrowSquareOut size={14} />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="text-center pt-4">
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
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No workflow runs found. Click refresh to fetch data.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {runLogs && (
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={24} />
                  Workflow Logs
                  {selectedRunId && (
                    <Badge variant="secondary">Run #{selectedRunId}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Complete logs from workflow run including all jobs and steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {runJobs.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h3 className="font-semibold text-sm">Jobs Summary</h3>
                    <div className="flex flex-wrap gap-2">
                      {runJobs.map((job) => (
                        <Badge
                          key={job.id}
                          variant={job.conclusion === 'success' ? 'default' : job.conclusion === 'failure' ? 'destructive' : 'outline'}
                        >
                          {job.name}: {job.conclusion || job.status}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <ScrollArea className="h-[600px] w-full border rounded-md">
                  <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-words">
                    {runLogs}
                  </pre>
                </ScrollArea>

                <div className="flex gap-2">
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
                  >
                    <Robot className={isAnalyzing ? 'animate-pulse' : ''} />
                    {isAnalyzing ? 'Analyzing Logs...' : 'Analyze Logs with AI'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Robot size={24} />
                AI-Powered Workflow Analysis
              </CardTitle>
              <CardDescription>
                {runLogs 
                  ? 'Deep analysis of downloaded workflow logs using GPT-4' 
                  : 'Deep analysis of your CI/CD pipeline using GPT-4'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {runLogs ? (
                <Button
                  onClick={analyzeRunLogs}
                  disabled={isAnalyzing}
                  size="lg"
                  className="w-full"
                >
                  <Robot className={isAnalyzing ? 'animate-pulse' : ''} />
                  {isAnalyzing ? 'Analyzing Logs...' : 'Analyze Downloaded Logs with AI'}
                </Button>
              ) : (
                <Button
                  onClick={analyzeWorkflows}
                  disabled={isAnalyzing || !data || data.length === 0}
                  size="lg"
                  className="w-full"
                >
                  <Robot className={isAnalyzing ? 'animate-pulse' : ''} />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Workflows with AI'}
                </Button>
              )}

              {isAnalyzing && (
                <div className="space-y-3">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              )}

              {analysis && !isAnalyzing && (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="bg-muted/50 p-6 rounded-lg border whitespace-pre-wrap">
                    {analysis}
                  </div>
                </div>
              )}

              {!analysis && !isAnalyzing && (
                <Alert>
                  <Info className="text-blue-600" />
                  <AlertTitle>No Analysis Yet</AlertTitle>
                  <AlertDescription>
                    {runLogs 
                      ? 'Click the button above to run an AI analysis of the downloaded logs. The AI will identify errors, provide root cause analysis, and suggest fixes.' 
                      : 'Download logs from a specific workflow run using the "Download Logs" button, or click above to analyze overall workflow patterns.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
