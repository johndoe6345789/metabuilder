/**
 * JSON Schema types for data-driven mock definitions
 *
 * Mock packages are defined in JSON files and automatically loaded.
 * No TypeScript boilerplate needed - just define the component trees in JSON.
 */

type PackageComponent = Record<string, unknown>
type PackageMetadata = Record<string, unknown>

/**
 * A mock render definition in JSON format
 * Supports simple static renders and template variables
 */
export interface JsonMockRender {
  /** The component tree to render */
  component: PackageComponent
  /** Optional description shown in Storybook */
  description?: string
}

/**
 * A complete mock package definition in JSON
 */
export interface JsonMockPackage {
  /** Package metadata */
  metadata: PackageMetadata
  /**
   * Render definitions keyed by script name
   * e.g., "init", "layout", "renderUsers"
   */
  renders: Record<string, JsonMockRender>
}

/**
 * Template variables that can be used in JSON mocks
 * Use {{variable}} syntax in string props
 */
export interface TemplateVariables {
  'user.username': string
  'user.email': string
  'user.level': number
  'user.id': string
  'tenant.name': string
  'tenant.id': string
  'nerdMode': boolean
  'theme': string
  [key: string]: unknown
}

/**
 * Process template variables in a component tree
 * Replaces {{variable}} with actual values from context
 */
export function processTemplates(
  component: PackageComponent,
  variables: TemplateVariables
): PackageComponent {
  const processValue = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return value.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
        const keys = key.trim().split('.')
        let result: unknown = variables
        for (const k of keys) {
          if (result && typeof result === 'object') {
            result = (result as Record<string, unknown>)[k]
          } else {
            return `{{${key}}}`
          }
        }
        return String(result ?? `{{${key}}}`)
      })
    }
    if (Array.isArray(value)) {
      return value.map(processValue)
    }
    if (value && typeof value === 'object') {
      const processed: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value)) {
        processed[k] = processValue(v)
      }
      return processed
    }
    return value
  }

  return processValue(component) as PackageComponent
}
