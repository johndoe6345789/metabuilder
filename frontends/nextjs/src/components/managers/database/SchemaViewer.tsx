import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
} from '@/components/ui'
import type { ModelSchema } from '@/lib/types/schema-types'

interface SchemaViewerProps {
  schemas: ModelSchema[]
  dbKeys: Record<string, string>
}

export function SchemaViewer({ schemas, dbKeys }: SchemaViewerProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Schemas</CardTitle>
          <CardDescription>Models and fields available in the database</CardDescription>
        </CardHeader>
        <CardContent>
          {schemas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No schemas configured yet.</p>
          ) : (
            <div className="space-y-3">
              {schemas.map(schema => (
                <div key={schema.name} className="rounded-lg border p-3 bg-muted/40">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        {schema.icon && <span className="text-lg">{schema.icon}</span>}
                        {schema.label || schema.name}
                        <span className="font-mono text-xs text-muted-foreground">
                          {schema.name}
                        </span>
                      </p>
                      {schema.labelPlural && (
                        <p className="text-xs text-muted-foreground">
                          Plural: {schema.labelPlural}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">{schema.fields.length} fields</Badge>
                  </div>
                  {schema.fields.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {schema.fields.slice(0, 6).map(field => (
                        <span
                          key={field.name}
                          className="rounded-full bg-background px-2 py-1 border"
                        >
                          {field.label || field.name} ({field.type})
                        </span>
                      ))}
                      {schema.fields.length > 6 && (
                        <span className="rounded-full bg-background px-2 py-1 border">
                          +{schema.fields.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Keys</CardTitle>
          <CardDescription>All KV storage keys used by the application</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            <div className="space-y-2">
              {Object.entries(dbKeys).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <span className="font-mono text-sm font-medium">{key}</span>
                    <p className="text-xs text-muted-foreground mt-1">{value}</p>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    KV
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
