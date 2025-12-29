import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface ResultPanelProps {
  title?: string
  result: unknown
  emptyLabel?: string
}

export function ResultPanel({ title = 'Latest Result', result, emptyLabel = 'No result yet' }: ResultPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {result ? (
          <pre className="whitespace-pre-wrap break-words rounded bg-muted/50 p-3 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </CardContent>
    </Card>
  )
}
