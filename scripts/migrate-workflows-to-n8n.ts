#!/usr/bin/env ts-node

/**
 * Workflow Migration Script: MetaBuilder → N8N Format
 *
 * Migrates MetaBuilder JSON Script v2.2.0 workflows to n8n-compliant format.
 *
 * Usage:
 *   npm run migrate:workflows              # Migrate all workflows
 *   npm run migrate:workflows -- --dry-run # Preview changes
 *   npm run migrate:workflows -- --file path/to/workflow.json
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { glob } from 'glob'

// ============================================================================
// Types
// ============================================================================

interface MetaBuilderNode {
  id: string
  type: string
  op?: string
  description?: string
  params?: Record<string, any>
  data?: Record<string, any>
  input?: any
  output?: any
  condition?: string
  [key: string]: any
}

interface MetaBuilderWorkflow {
  version?: string
  name: string
  description?: string
  nodes: MetaBuilderNode[]
  connections?: Array<{ from: string; to: string }> | Record<string, string[]>
  trigger?: {
    type: string
    [key: string]: any
  }
  metadata?: Record<string, any>
  errorHandler?: any
}

interface N8NNode {
  id: string
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  parameters: Record<string, any>
  disabled?: boolean
  notes?: string
  notesInFlow?: boolean
  retryOnFail?: boolean
  maxTries?: number
  waitBetweenTries?: number
  continueOnFail?: boolean
  alwaysOutputData?: boolean
  executeOnce?: boolean
  credentials?: Record<string, { id: string | number; name?: string }>
  webhookId?: string
  onError?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput'
}

interface N8NConnectionTarget {
  node: string
  type: string
  index: number
}

interface N8NWorkflow {
  name: string
  id?: string | number
  active?: boolean
  versionId?: string
  createdAt?: string
  updatedAt?: string
  tags?: Array<{ id?: string | number; name: string }>
  meta?: Record<string, any>
  settings?: {
    timezone?: string
    executionTimeout?: number
    saveExecutionProgress?: boolean
    saveManualExecutions?: boolean
    saveDataErrorExecution?: 'all' | 'none'
    saveDataSuccessExecution?: 'all' | 'none'
    saveDataManualExecution?: 'all' | 'none'
    errorWorkflowId?: string | number
    callerPolicy?: string
  }
  pinData?: Record<string, Array<Record<string, any>>>
  nodes: N8NNode[]
  connections: Record<string, Record<string, Record<string, N8NConnectionTarget[]>>>
  staticData?: Record<string, any>
  credentials?: Array<{
    nodeId: string
    credentialType: string
    credentialId: string | number
  }>
  triggers?: Array<{
    nodeId: string
    kind: 'webhook' | 'schedule' | 'queue' | 'email' | 'poll' | 'manual' | 'other'
    enabled?: boolean
    meta?: Record<string, any>
  }>
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert snake_case or kebab-case ID to Title Case Name
 * @example idToName('parse_body') → 'Parse Body'
 * @example idToName('create-app') → 'Create App'
 */
function idToName(idInput: unknown): string {
  // Handle non-string IDs
  let id = typeof idInput === 'string' ? idInput : String(idInput ?? 'node')

  return id
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Generate a layout position for a node based on its index
 */
function generatePosition(index: number, totalNodes: number): [number, number] {
  // Simple grid layout: 3 columns, 200px spacing
  const col = index % 3
  const row = Math.floor(index / 3)
  return [100 + col * 300, 100 + row * 200]
}

/**
 * Map MetaBuilder node type to N8N node type
 */
function mapNodeType(mbType: string, op?: string): string {
  // If type already looks like an n8n type, use it
  if (mbType.includes('.')) {
    return mbType
  }

  // Map common MetaBuilder types
  const typeMap: Record<string, string> = {
    trigger: 'metabuilder.trigger',
    operation: 'metabuilder.operation',
    action: 'metabuilder.action',
    condition: 'metabuilder.condition',
    transform: 'metabuilder.transform',
  }

  // Check for operation-specific mappings
  if (op) {
    const opMap: Record<string, string> = {
      database_create: 'metabuilder.database',
      database_read: 'metabuilder.database',
      database_update: 'metabuilder.database',
      database_delete: 'metabuilder.database',
      validate: 'metabuilder.validate',
      rate_limit: 'metabuilder.rateLimit',
      condition: 'metabuilder.condition',
      transform_data: 'metabuilder.transform',
      http_request: 'n8n-nodes-base.httpRequest',
      emit_event: 'metabuilder.emitEvent',
      http_response: 'metabuilder.httpResponse',
    }

    if (opMap[op]) {
      return opMap[op]
    }
  }

  return typeMap[mbType] || `metabuilder.${mbType}`
}

/**
 * Flatten nested parameters structure
 * Handles cases where parameters are wrapped multiple times with node-level attributes
 * (name, typeVersion, position) that got merged into the parameters object
 */
function flattenParameters(obj: any, depth = 0): Record<string, any> {
  // Safety check for infinite recursion
  if (depth > 10) {
    return obj
  }

  // If it's not an object or is an array, return as-is
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj
  }

  // Get keys
  const keys = Object.keys(obj)

  // If we have node-level attributes (name/typeVersion/position) at parameter level,
  // these were incorrectly merged in. Extract from nested 'parameters' field.
  if ((keys.includes('name') || keys.includes('typeVersion') || keys.includes('position')) &&
      keys.includes('parameters')) {
    // Skip the node-level attributes and use the nested parameters
    return flattenParameters(obj.parameters, depth + 1)
  }

  // If it has the structure { parameters: { ... } } and only that key, unwrap it
  if (keys.length === 1 && keys[0] === 'parameters' && typeof obj.parameters === 'object') {
    return flattenParameters(obj.parameters, depth + 1)
  }

  // Otherwise, recursively flatten all values
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = flattenParameters(value, depth)
    } else {
      result[key] = value
    }
  }
  return result
}

/**
 * Convert MetaBuilder node to N8N node
 */
function convertNode(
  mbNode: MetaBuilderNode,
  index: number,
  totalNodes: number
): N8NNode {
  const name = idToName(mbNode.id)
  const type = mapNodeType(mbNode.type, mbNode.op)

  // Build parameters by merging all relevant fields
  let parameters: Record<string, any> = {
    ...(mbNode.params || {}),
    ...(mbNode.data ? { data: mbNode.data } : {}),
    ...(mbNode.input ? { input: mbNode.input } : {}),
    ...(mbNode.output ? { output: mbNode.output } : {}),
    ...(mbNode.condition ? { condition: mbNode.condition } : {}),
    ...(mbNode.op ? { operation: mbNode.op } : {}),
  }

  // Add other fields that aren't standard
  Object.keys(mbNode).forEach(key => {
    if (
      !['id', 'type', 'op', 'description', 'params', 'data', 'input', 'output', 'condition'].includes(key)
    ) {
      parameters[key] = mbNode[key]
    }
  })

  // Flatten any nested parameters structure
  parameters = flattenParameters(parameters)

  const n8nNode: N8NNode = {
    id: mbNode.id,
    name,
    type,
    typeVersion: 1,
    position: generatePosition(index, totalNodes),
    parameters,
  }

  // Add optional fields
  if (mbNode.description) {
    n8nNode.notes = mbNode.description
    n8nNode.notesInFlow = false
  }

  return n8nNode
}

/**
 * Convert MetaBuilder connections to N8N format
 */
function convertConnections(
  mbConnections: Array<{ from: string; to: string }> | Record<string, string[]> | undefined,
  nodeIdToName: Map<string, string>
): Record<string, Record<string, Record<string, N8NConnectionTarget[]>>> {
  const n8nConnections: Record<string, Record<string, Record<string, N8NConnectionTarget[]>>> = {}

  if (!mbConnections) {
    return n8nConnections
  }

  // Handle array format: [{ from: 'id1', to: 'id2' }]
  if (Array.isArray(mbConnections)) {
    mbConnections.forEach(conn => {
      const fromName = nodeIdToName.get(conn.from) || idToName(conn.from)
      const toName = nodeIdToName.get(conn.to) || idToName(conn.to)

      if (!n8nConnections[fromName]) {
        n8nConnections[fromName] = {}
      }
      if (!n8nConnections[fromName].main) {
        n8nConnections[fromName].main = {}
      }
      if (!n8nConnections[fromName].main['0']) {
        n8nConnections[fromName].main['0'] = []
      }

      n8nConnections[fromName].main['0'].push({
        node: toName,
        type: 'main',
        index: 0,
      })
    })
  }
  // Handle object format: { 'id1': ['id2', 'id3'] }
  else {
    Object.entries(mbConnections).forEach(([from, targets]) => {
      const fromName = nodeIdToName.get(from) || idToName(from)

      if (!n8nConnections[fromName]) {
        n8nConnections[fromName] = {}
      }
      if (!n8nConnections[fromName].main) {
        n8nConnections[fromName].main = {}
      }
      if (!n8nConnections[fromName].main['0']) {
        n8nConnections[fromName].main['0'] = []
      }

      // Ensure targets is an array
      const targetArray = Array.isArray(targets) ? targets : [targets]
      targetArray.forEach(target => {
        const toName = nodeIdToName.get(target) || idToName(target)
        n8nConnections[fromName].main['0'].push({
          node: toName,
          type: 'main',
          index: 0,
        })
      })
    })
  }

  return n8nConnections
}

/**
 * Convert MetaBuilder trigger to N8N triggers array
 */
function convertTriggers(
  mbTrigger: { type: string; [key: string]: any } | undefined,
  nodes: N8NNode[]
): Array<{
  nodeId: string
  kind: 'webhook' | 'schedule' | 'queue' | 'email' | 'poll' | 'manual' | 'other'
  enabled?: boolean
  meta?: Record<string, any>
}> {
  if (!mbTrigger) {
    return []
  }

  // Find trigger node (first node with type containing 'trigger')
  const triggerNode = nodes.find(node => node.type.includes('trigger'))
  if (!triggerNode) {
    return []
  }

  // Map trigger type to n8n kind
  const kindMap: Record<string, 'webhook' | 'schedule' | 'queue' | 'email' | 'poll' | 'manual' | 'other'> = {
    http: 'webhook',
    webhook: 'webhook',
    schedule: 'schedule',
    cron: 'schedule',
    queue: 'queue',
    email: 'email',
    poll: 'poll',
    manual: 'manual',
  }

  const kind = kindMap[mbTrigger.type] || 'other'

  // Build trigger meta from trigger config
  const meta: Record<string, any> = {}
  Object.entries(mbTrigger).forEach(([key, value]) => {
    if (key !== 'type') {
      meta[key] = value
    }
  })

  return [
    {
      nodeId: triggerNode.id,
      kind,
      enabled: true,
      meta: Object.keys(meta).length > 0 ? meta : undefined,
    },
  ]
}

/**
 * Migrate a single MetaBuilder workflow to N8N format
 */
function migrateWorkflow(mbWorkflow: MetaBuilderWorkflow): N8NWorkflow {
  // Build node ID → name mapping
  const nodeIdToName = new Map<string, string>()
  mbWorkflow.nodes.forEach(node => {
    nodeIdToName.set(node.id, idToName(node.id))
  })

  // Convert nodes
  const n8nNodes = mbWorkflow.nodes.map((node, index) =>
    convertNode(node, index, mbWorkflow.nodes.length)
  )

  // Convert connections
  const n8nConnections = convertConnections(mbWorkflow.connections, nodeIdToName)

  // Convert triggers
  const n8nTriggers = convertTriggers(mbWorkflow.trigger, n8nNodes)

  // Build N8N workflow
  const n8nWorkflow: N8NWorkflow = {
    name: mbWorkflow.name,
    active: false,
    nodes: n8nNodes,
    connections: n8nConnections,
    staticData: {},
    meta: {},
  }

  // Add optional metadata
  if (mbWorkflow.description) {
    n8nWorkflow.meta!.description = mbWorkflow.description
  }

  if (mbWorkflow.metadata) {
    n8nWorkflow.meta = { ...n8nWorkflow.meta, ...mbWorkflow.metadata }

    // Extract tags
    if (Array.isArray(mbWorkflow.metadata.tags)) {
      n8nWorkflow.tags = mbWorkflow.metadata.tags.map((tag: string) => ({ name: tag }))
    }

    // Extract timestamps
    if (mbWorkflow.metadata.created) {
      n8nWorkflow.createdAt = new Date(mbWorkflow.metadata.created).toISOString()
    }
    if (mbWorkflow.metadata.updated) {
      n8nWorkflow.updatedAt = new Date(mbWorkflow.metadata.updated).toISOString()
    }
  }

  // Add triggers
  if (n8nTriggers.length > 0) {
    n8nWorkflow.triggers = n8nTriggers
  }

  // Add default settings
  n8nWorkflow.settings = {
    timezone: 'UTC',
    executionTimeout: 3600,
    saveExecutionProgress: true,
    saveDataErrorExecution: 'all',
    saveDataSuccessExecution: 'all',
  }

  return n8nWorkflow
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * Read and parse a workflow file
 */
async function readWorkflow(filePath: string): Promise<MetaBuilderWorkflow> {
  const content = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(content)
}

/**
 * Write a migrated workflow to file
 */
async function writeWorkflow(filePath: string, workflow: N8NWorkflow): Promise<void> {
  const content = JSON.stringify(workflow, null, 2)
  await fs.writeFile(filePath, content + '\n', 'utf-8')
}

/**
 * Find all workflow files in the project
 */
async function findWorkflowFiles(): Promise<string[]> {
  const patterns = [
    'workflow/examples/**/*.json',
    'workflow/examples/**/*.jsonscript',
    'packages/*/workflow/**/*.jsonscript',
    'packagerepo/backend/workflows/**/*.json',
  ]

  const files: string[] = []
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: process.cwd(), absolute: true })
    // Filter out package.json files
    const filtered = matches.filter(file => !file.endsWith('package.json'))
    files.push(...filtered)
  }

  return files
}

// ============================================================================
// Main Migration Logic
// ============================================================================

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const fileArg = args.find(arg => arg.startsWith('--file='))
  const targetFile = fileArg?.split('=')[1]

  console.log('🔄 MetaBuilder → N8N Workflow Migration\n')

  // Determine files to migrate
  const filesToMigrate = targetFile ? [targetFile] : await findWorkflowFiles()

  console.log(`📁 Found ${filesToMigrate.length} workflow files\n`)

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n')
  }

  let successCount = 0
  let errorCount = 0

  for (const filePath of filesToMigrate) {
    try {
      console.log(`Processing: ${path.basename(filePath)}`)

      // Read MetaBuilder workflow
      const mbWorkflow = await readWorkflow(filePath)

      // Migrate to N8N format
      const n8nWorkflow = migrateWorkflow(mbWorkflow)

      // Validate basic structure
      if (!n8nWorkflow.name || n8nWorkflow.nodes.length === 0) {
        throw new Error('Invalid workflow structure after migration')
      }

      // Write to file (unless dry run)
      if (!isDryRun) {
        // Backup original
        const backupPath = filePath.replace(/\.(json|jsonscript)$/, '.backup.$1')
        await fs.copyFile(filePath, backupPath)

        // Write migrated version
        await writeWorkflow(filePath, n8nWorkflow)
        console.log(`  ✅ Migrated (backup: ${path.basename(backupPath)})`)
      } else {
        console.log(`  ✅ Would migrate (dry run)`)
      }

      successCount++
    } catch (error) {
      console.error(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`)
      errorCount++
    }

    console.log('')
  }

  // Summary
  console.log('━'.repeat(60))
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`📊 Total: ${filesToMigrate.length}`)

  if (isDryRun) {
    console.log('\n💡 Run without --dry-run to apply changes')
  }

  process.exit(errorCount > 0 ? 1 : 0)
}

// Run migration
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
