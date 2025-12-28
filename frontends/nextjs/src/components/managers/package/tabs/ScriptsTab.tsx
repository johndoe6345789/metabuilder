import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

interface Script {
  id?: string
  name?: string
  description?: string
  category?: string
  code?: string
}

interface ScriptsTabProps {
  scripts: Script[]
}

export function ScriptsTab({ scripts }: ScriptsTabProps) {
  if (!scripts.length) {
    return <p className="text-sm text-muted-foreground">No scripts included in this package.</p>
  }

  return (
    <div className="space-y-3">
      {scripts.map((script, index) => (
        <Card key={script.id ?? script.name ?? index}>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">{script.name ?? 'Unnamed Script'}</CardTitle>
              <CardDescription>{script.description ?? 'No description provided.'}</CardDescription>
            </div>
            {script.category ? <Badge variant="outline">{script.category}</Badge> : null}
          </CardHeader>
          {script.code ? (
            <CardContent>
              <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto">
                <code>{script.code}</code>
              </pre>
            </CardContent>
          ) : null}
        </Card>
      ))}
    </div>
  )
}
