import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, XCircle, ArrowClockwise, ArrowSquareOut, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Octokit } from 'octokit'

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
}

export function GitHubActionsFetcher() {
  const [data, setData] = useState<WorkflowRun[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const [needsAuth, setNeedsAuth] = useState(false)

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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">GitHub Actions Monitor</h1>
            <p className="text-muted-foreground mt-2">
              Repository: <code className="text-sm bg-muted px-2 py-1 rounded">johndoe6345789/metabuilder</code>
            </p>
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
      </div>
    </div>
  )
}
