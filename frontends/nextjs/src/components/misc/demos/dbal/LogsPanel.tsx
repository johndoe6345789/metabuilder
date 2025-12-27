import { Card, CardContent, CardHeader, CardTitle, ScrollArea } from '@/components/ui'

interface LogsPanelProps {
  logs: string[]
  title?: string
}

export function LogsPanel({ logs, title = 'Activity' }: LogsPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 rounded border bg-muted/50 p-3 font-mono text-sm">
          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">No events yet</p>
            ) : (
              logs.map((entry, index) => (
                <div key={index} className="text-foreground">
                  {entry}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
