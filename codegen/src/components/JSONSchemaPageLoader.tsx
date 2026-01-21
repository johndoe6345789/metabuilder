import { PageRenderer } from '@/lib/json-ui/page-renderer'
import { useSchemaLoader } from '@/hooks/use-schema-loader'

interface JSONSchemaPageLoaderProps {
  schemaPath: string
  data?: Record<string, any>
  functions?: Record<string, any>
}

export function JSONSchemaPageLoader({ schemaPath, data, functions }: JSONSchemaPageLoaderProps) {
  const { schema, loading, error } = useSchemaLoader(schemaPath)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading {schemaPath}...</p>
        </div>
      </div>
    )
  }

  if (error || !schema) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">{error || 'Schema not found'}</p>
      </div>
    )
  }

  return <PageRenderer schema={schema} data={data} functions={functions} />
}
