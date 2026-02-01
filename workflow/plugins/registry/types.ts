/**
 * Node Registry Type Definitions
 *
 * Comprehensive TypeScript interfaces for the MetaBuilder N8N node registry system.
 * Defines node types, properties, execution constraints, and plugin metadata.
 */

/**
 * Property definition for node parameters
 */
export interface PropertyDefinition {
  displayName: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'options'
  required?: boolean
  default?: any
  description?: string
  options?: PropertyOption[]
  typeOptions?: Record<string, any>
  placeholder?: string
  hint?: string
}

/**
 * Option choice for select/enum properties
 */
export interface PropertyOption {
  name: string
  value: string | number | boolean
  description?: string
}

/**
 * Node port definition (input/output)
 */
export interface NodePort {
  name: string
  type: 'main' | 'error' | 'success' | 'condition'
  displayName: string
  description?: string
  index?: number
  maxConnections?: number
}

/**
 * Credential requirement for a node
 */
export interface CredentialDefinition {
  name: string
  required: boolean
  displayOptions?: {
    show?: Record<string, any[]>
    hide?: Record<string, any[]>
  }
}

/**
 * Execution mode and constraints for a node
 */
export interface ExecutionDefinition {
  modes: ('trigger' | 'operation' | 'action' | 'logic' | 'iterator')[]
  maxTimeout: number
  retryable: boolean
  concurrency?: number
  rateLimit?: {
    requests: number
    windowMs: number
  }
}

/**
 * Multi-language execution support
 */
export interface MultiLanguageSupport {
  ts?: string
  python?: string
  go?: string
  rust?: string
  cpp?: string
  mojo?: string
}

/**
 * Codex metadata for UI discovery
 */
export interface CodexMetadata {
  categories: string[]
  label: string
  description?: string
  icon?: string
  color?: string
}

/**
 * Complete node type definition
 */
export interface NodeTypeDefinition {
  name: string
  displayName: string
  description: string
  group: string
  codex: CodexMetadata
  inputs: NodePort[]
  outputs: NodePort[]
  properties: PropertyDefinition[]
  execution: ExecutionDefinition
  credentials?: CredentialDefinition[]
  multiLanguage?: MultiLanguageSupport
  version?: string
  deprecated?: boolean
  beta?: boolean
  hidden?: boolean
}

/**
 * Node registry category
 */
export interface RegistryCategory {
  id: string
  name: string
  description: string
  icon?: string
}

/**
 * Plugin definition in registry
 */
export interface PluginDefinition {
  id: string
  name: string
  version: string
  nodeTypes: string[]
  languages: string[]
  repository: 'internal' | 'npm' | 'github' | string
  description?: string
  author?: string
  license?: string
}

/**
 * Complete node registry schema
 */
export interface NodeRegistry {
  $schema?: string
  version: string
  description?: string
  nodeTypes: NodeTypeDefinition[]
  categories: RegistryCategory[]
  plugins: PluginDefinition[]
  lastUpdated?: string
  metadata?: Record<string, any>
}

/**
 * Runtime node executor configuration
 */
export interface NodeExecutorConfig {
  nodeType: string
  properties: Record<string, any>
  credentials?: Record<string, { id: string; name: string }>
  timeout?: number
  retryPolicy?: {
    maxAttempts: number
    backoffMultiplier: number
    initialDelayMs: number
  }
  errorPolicy?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput'
}

/**
 * Parameter validation constraints
 */
export interface ValidationConstraint {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'enum' | 'custom'
  value: any
  message?: string
}

/**
 * Node execution result
 */
export interface NodeExecutionResult {
  success: boolean
  output: any
  error?: {
    message: string
    code: string
    originalError?: Error
  }
  duration: number
  timestamp: Date
}

/**
 * Plugin discovery metadata
 */
export interface PluginMetadata {
  id: string
  name: string
  version: string
  entryPoint: string
  nodeTypes: string[]
  capabilities: string[]
  dependencies?: Record<string, string>
}

/**
 * Registry validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

/**
 * Registry validation error
 */
export interface ValidationError {
  path: string
  message: string
  code: string
  severity: 'error'
}

/**
 * Registry validation warning
 */
export interface ValidationWarning {
  path: string
  message: string
  code: string
  severity: 'warning'
}

/**
 * Node type query result
 */
export interface NodeTypeQuery {
  nodeType: string
  found: boolean
  definition?: NodeTypeDefinition
  plugin?: PluginDefinition
}

/**
 * Registry statistics
 */
export interface RegistryStats {
  totalNodeTypes: number
  totalCategories: number
  totalPlugins: number
  languageSupport: Record<string, number>
  groupDistribution: Record<string, number>
}
