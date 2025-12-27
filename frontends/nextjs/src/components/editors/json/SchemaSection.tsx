import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

interface SchemaSectionProps {
  schema?: unknown
}

export function SchemaSection({ schema }: SchemaSectionProps) {
  if (!schema) return null

  const formattedSchema =
    typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1">
        <CardTitle>Schema</CardTitle>
        <CardDescription>Reference for the expected JSON structure</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="max-h-48 overflow-auto rounded border bg-muted px-3 py-2 text-xs leading-5 whitespace-pre-wrap">
          {formattedSchema}
        </pre>
      </CardContent>
    </Card>
  )
}
