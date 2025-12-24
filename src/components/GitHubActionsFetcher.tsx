import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, ArrowClockwise, ArrowSquareOut, Info, Warning, TrendUp, TrendDown, Robot, Download, FileText } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Octokit } from 'octokit'
import { ScrollArea } from '@/components/ui/scroll-area'

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
      const user = await spark.user()
      
      if (!user || !user.id) {
        setNeedsAuth(true)
        throw new Error('GitHub authentication required')
      }

      const octokit = new Octokit()
      
      const { data: workflows } = await octokit.rest.actions.listWorkflowRunsForRepo({
        owner: 'johndoe6345789',
        repo: 'metabuilder',
        per_page: 20
      })

      setData(workflows.workflow_runs as WorkflowRun[])
      setLastFetched(new Date())
      setSecondsUntilRefresh(30)
      toast.success(`Fetched ${workflows.workflow_runs.length} workflow runs`)
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
      const prompt = spark.llmPrompt`You are a DevOps expert analyzing GitHub Actions workflow data.

Given the following workflow runs data:
${JSON.stringify(data, null, 2)}

Provide a comprehensive analysis including:
1. **Overall Build Health**: Current state of the CI/CD pipeline
2. **Recent Failures**: List any failed builds and potential root causes
3. **Patterns**: Identify any patterns in failures (specific branches, times, events)
4. **Performance**: Comment on build frequency and completion times
5. **Recommendations**: Specific actionable steps to improve the pipeline
6. **Risk Assessment**: Any immediate concerns that need attention

Format your response in markdown with clear sections and bullet points.`

      const result = await spark.llm(prompt, 'gpt-4o')
      setAnalysis(result)
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
      const octokit = new Octokit()
      
      const { data: jobs } = await octokit.rest.actions.listJobsForWorkflowRun({
        owner: 'johndoe6345789',
        repo: 'metabuilder',
        run_id: runId
      })

      setRunJobs(jobs.jobs as Job[])

      const allLogs: string[] = []
      allLogs.push(`=================================================`)
      allLogs.push(`WORKFLOW RUN: ${runName}`)
      allLogs.push(`RUN ID: ${runId}`)
      allLogs.push(`JOBS COUNT: ${jobs.jobs.length}`)
      allLogs.push(`=================================================\n`)

      for (const job of jobs.jobs) {
        allLogs.push(`\n${'='.repeat(80)}`)
        allLogs.push(`JOB: ${job.name}`)
        allLogs.push(`JOB ID: ${job.id}`)
        allLogs.push(`STATUS: ${job.status}`)
        allLogs.push(`CONCLUSION: ${job.conclusion || 'N/A'}`)
        allLogs.push(`STARTED: ${job.started_at}`)
        allLogs.push(`COMPLETED: ${job.completed_at || 'Running...'}`)
        allLogs.push(`${'='.repeat(80)}`)

        try {
          const { data: logData } = await octokit.rest.actions.downloadJobLogsForWorkflowRun({
            owner: 'johndoe6345789',
            repo: 'metabuilder',
            job_id: job.id
          })

          if (typeof logData === 'string') {
            allLogs.push(logData)
          } else {
            allLogs.push(`[Log data returned in binary format - ${job.steps?.length || 0} steps]`)
            
            if (job.steps && job.steps.length > 0) {
              job.steps.forEach((step: JobStep) => {
                allLogs.push(`\n  Step ${step.number}: ${step.name}`)
                allLogs.push(`    Status: ${step.status} | Conclusion: ${step.conclusion || 'N/A'}`)
                if (step.started_at) allLogs.push(`    Started: ${step.started_at}`)
                if (step.completed_at) allLogs.push(`    Completed: ${step.completed_at}`)
              })
            }
          }
        } catch (logErr) {
          allLogs.push(`\n[Could not fetch logs for this job - ${(logErr as Error).message}]`)
          
          if (job.steps && job.steps.length > 0) {
            allLogs.push(`\nSteps in this job:`)
            job.steps.forEach((step: JobStep) => {
              allLogs.push(`  ${step.number}. ${step.name}`)
              allLogs.push(`     Status: ${step.status} | Conclusion: ${step.conclusion || 'N/A'}`)
            })
          }
        }

        allLogs.push('')
      }

      const logsText = allLogs.join('\n')
      setRunLogs(logsText)

      const blob = new Blob([logsText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workflow-logs-${runId}-${new Date().toISOString()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

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
      const prompt = spark.llmPrompt`You are a DevOps expert analyzing GitHub Actions workflow logs.

Workflow: ${selectedRun?.name || 'Unknown'}
Run ID: ${selectedRunId}
Status: ${selectedRun?.status}
Conclusion: ${selectedRun?.conclusion || 'N/A'}

=== COMPLETE WORKFLOW LOGS ===
${runLogs}
=== END LOGS ===

Provide a comprehensive analysis including:
1. **Root Cause Analysis**: Identify the specific error(s) that caused failures
2. **Error Details**: Extract exact error messages, line numbers, and stack traces
3. **Failed Steps**: List which jobs/steps failed and why
4. **Dependencies Issues**: Any missing packages, version conflicts, or dependency problems
5. **Configuration Problems**: Issues with workflow configuration, environment variables, secrets
6. **Recommended Fixes**: Specific, actionable steps to fix each issue with code examples where applicable
7. **Prevention**: How to prevent similar issues in the future

Format your response in clear markdown with code blocks for any suggested fixes.`

      const result = await spark.llm(prompt, 'gpt-4o')
      setAnalysis(result)
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
    const successful = data.filter(r => r.conclusion === 'success').length
    const failed = data.filter(r => r.conclusion === 'failure').length
    const cancelled = data.filter(r => r.conclusion === 'cancelled').length
    const inProgress = data.filter(r => r.status !== 'completed').length
    
    const mostRecent = data[0]
    const mostRecentPassed = mostRecent?.conclusion === 'success'
    const mostRecentFailed = mostRecent?.conclusion === 'failure'
    const mostRecentRunning = mostRecent?.status !== 'completed'
    
    const successRate = completed > 0 ? Math.round((successful / completed) * 100) : 0
    const recentRuns = data.slice(0, 5)
    const recentSuccessful = recentRuns.filter(r => r.conclusion === 'success').length
    const recentFailed = recentRuns.filter(r => r.conclusion === 'failure').length
    
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
      mostRecentRunning
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
                  {conclusion.mostRecentPassed && 'Most Recent Build: PASSED ✓'}
                  {conclusion.mostRecentFailed && 'Most Recent Build: FAILED ✗'}
                  {conclusion.mostRecentRunning && 'Most Recent Build: RUNNING...'}
                </AlertTitle>
                <AlertDescription className="space-y-2">
                  <div className="text-lg font-medium">
                    {conclusion.mostRecent.name}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">Branch:</span>
                      <code className="bg-background/60 px-2 py-0.5 rounded text-xs font-mono">
                        {conclusion.mostRecent.head_branch}
                      </code>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">Updated:</span>
                      <span>{new Date(conclusion.mostRecent.updated_at).toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant={conclusion.mostRecentPassed ? 'default' : 'destructive'}
                      size="sm"
                      asChild
                    >
                      <a
                        href={conclusion.mostRecent.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        View Details on GitHub
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
