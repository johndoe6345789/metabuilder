import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, XCircle, ArrowClockwise, ArrowSquareOut } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function GitHubActionsFetcher() {
  const [data, setData] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const fetchGitHubActions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('https://github.com/johndoe6345789/metabuilder/actions')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      setData(text)
      setLastFetched(new Date())
      toast.success('GitHub Actions data fetched successfully')
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">GitHub Actions Fetcher</h1>
            <p className="text-muted-foreground mt-2">
              Fetching data from: <code className="text-sm bg-muted px-2 py-1 rounded">https://github.com/johndoe6345789/metabuilder/actions</code>
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
              Response Data
              <a
                href="https://github.com/johndoe6345789/metabuilder/actions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-normal text-primary hover:underline flex items-center gap-2"
              >
                Open in Browser
                <ArrowSquareOut size={16} />
              </a>
            </CardTitle>
            <CardDescription>
              Raw HTML response from GitHub Actions page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/6" />
              </div>
            ) : data ? (
              <div className="relative">
                <div className="absolute top-2 right-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(data)
                      toast.success('Copied to clipboard')
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[600px] text-xs">
                  <code>{data}</code>
                </pre>
                <div className="mt-4 text-sm text-muted-foreground">
                  Response size: {(data.length / 1024).toFixed(2)} KB
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No data available. Click refresh to fetch.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
