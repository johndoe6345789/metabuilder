import { useState, useEffect } from 'react'
import { PageSchema } from '@/types/json-ui'

export function useSchemaLoader(schemaPath: string) {
  const [schema, setSchema] = useState<PageSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSchema() {
      try {
        setLoading(true)
        setError(null)

        // Dynamically import the JSON schema
        const schemaModule = await import(`../config/pages/${schemaPath}.json`)
        setSchema(schemaModule.default || schemaModule)
      } catch (err) {
        console.error(`[Schema Loader] Failed to load schema: ${schemaPath}`, err)
        setError(`Failed to load page schema: ${schemaPath}`)
      } finally {
        setLoading(false)
      }
    }

    loadSchema()
  }, [schemaPath])

  return { schema, loading, error }
}
