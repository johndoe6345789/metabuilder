import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowClockwise, Info, Warning } from '@phosphor-icons/react'
import { useGitHubFetcher } from '@/hooks/useGitHubFetcher'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { WorkflowRunCard } from '@/components/WorkflowRunCard'
import { ScrollArea } from '@/components/ui/scroll-area'

/**
 * Refactored GitHub Actions Fetcher Component
 * 
 * Responsibilities (simplified):
 * 1. Fetch and display workflow runs
 * 2. Manage auto-refresh
 * 3. Handle user interactions
 * 
 * Business logic delegated to hooks:
 * - useGitHubFetcher: API calls
 * - useAutoRefresh: Polling logic
 */
export function GitHubActionsFetcher() {
  const fetcher = useGitHubFetcher()
  const {
    isAutoRefreshing,
    secondsUntilNextRefresh,
    toggleAutoRefresh,
  } = useAutoRefresh({
    intervalMs: 30000,
    onRefresh: fetcher.fetch,
    enabled: false,
  })

  useEffect(() => {
    fetcher.fetch()
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>GitHub Actions</CardTitle>
              <CardDescription>Recent workflow runs</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {fetcher.lastFetched && (
                <span className="text-xs text-gray-500">
                  Last: {fetcher.lastFetched.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetcher.fetch}
                disabled={fetcher.isLoading}
              >
                <ArrowClockwise size={16} className="mr-1" />
                Refresh
              </Button>
              <Button
                variant={isAutoRefreshing ? 'default' : 'outline'}
                size="sm"
                onClick={toggleAutoRefresh}
              >
                {isAutoRefreshing ? `Auto (${secondsUntilNextRefresh}s)` : 'Auto Off'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {fetcher.error && (
            <Alert variant="destructive">
              <Warning size={16} />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{fetcher.error}</AlertDescription>
            </Alert>
          )}

          {fetcher.isLoading && !fetcher.data && (
            <div className="space-y-2">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          )}

          {!fetcher.isLoading && !fetcher.data && (
            <Alert>
              <Info size={16} />
              <AlertTitle>No data</AlertTitle>
              <AlertDescription>Click refresh to load workflow runs</AlertDescription>
            </Alert>
          )}

          {fetcher.data && fetcher.data.length > 0 && (
            <ScrollArea className="h-96">
              <div className="space-y-2 pr-4">
                {fetcher.data.map(run => (
                  <WorkflowRunCard
                    key={run.id}
                    name={run.name}
                    status={run.status}
                    conclusion={run.conclusion}
                    branch={run.head_branch}
                    createdAt={run.created_at}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {isAutoRefreshing && (
        <div className="text-xs text-gray-500 text-center">
          <Badge variant="secondary">
            Auto-refresh enabled • Next in {secondsUntilNextRefresh}s
          </Badge>
        </div>
      )}
    </div>
  )
}
