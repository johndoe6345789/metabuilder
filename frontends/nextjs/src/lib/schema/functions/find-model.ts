import type { ModelSchema, SchemaConfig } from '../types/schema-types'

/**
 * Find a model by name within a schema configuration
 * @param schema - The schema configuration to search
 * @param appName - The application name
 * @param modelName - The model name to find
 * @returns The model schema if found, undefined otherwise
 */
export const findModel = (
  schema: SchemaConfig,
  appName: string,
  modelName: string
): ModelSchema | undefined => {
  const app = schema.apps.find(a => a.name === appName)
  if (!app) return undefined
  return app.models.find(m => m.name === modelName)
}
