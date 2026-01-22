#!/usr/bin/env ts-node

/**
 * Fix Workflow Parameters Script
 *
 * Flattens nested parameters in already-migrated workflows that have
 * deeply nested structure due to the migration script wrapping parameters
 * multiple times.
 *
 * Usage:
 *   npm run fix:workflow-params              # Fix all workflows
 *   npm run fix:workflow-params -- --dry-run # Preview changes
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { glob } from 'glob'

interface N8NNode {
  id: string
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  parameters: Record<string, any>
  [key: string]: any
}

interface N8NWorkflow {
  name: string
  nodes: N8NNode[]
  connections: Record<string, any>
  [key: string]: any
}

/**
 * Flatten nested parameters structure
 * Handles cases where parameters are wrapped multiple times like:
 * { parameters: { parameters: { parameters: { actual: value } } } }
 */
function flattenParameters(obj: any, depth = 0): Record<string, any> {
  // Safety check for infinite recursion
  if (depth > 10) {
    console.warn(`Max recursion depth reached, stopping at depth ${depth}`)
    return obj
  }

  // If it's not an object or is an array, return as-is
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj
  }

  // Get keys
  const keys = Object.keys(obj)

  // If ONLY key is 'parameters' and value is an object, unwrap and recurse
  if (keys.length === 1 && keys[0] === 'parameters' && typeof obj.parameters === 'object' && obj.parameters !== null) {
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
 * Check if a node has nested parameters that need flattening
 */
function hasNestedParameters(node: N8NNode): boolean {
  const params = node.parameters || {}
  const keys = Object.keys(params)

  // Check if first level has excessive nesting
  if (keys.length === 1 && keys[0] === 'name' && params.name === node.name) {
    // Likely has nested structure
    return true
  }

  // Check for multiple parameters levels
  if (keys.includes('parameters') && typeof params.parameters === 'object') {
    return true
  }

  return false
}

/**
 * Fix a single workflow
 */
async function fixWorkflow(filePath: string, dryRun: boolean): Promise<{ fixed: boolean; nodeCount: number }> {
  const content = await fs.readFile(filePath, 'utf-8')
  const workflow: N8NWorkflow = JSON.parse(content)

  let fixedCount = 0

  // Fix each node's parameters
  for (const node of workflow.nodes) {
    if (hasNestedParameters(node)) {
      node.parameters = flattenParameters(node.parameters)
      fixedCount++
    }
  }

  // Write back if changes were made and not a dry run
  if (fixedCount > 0 && !dryRun) {
    const newContent = JSON.stringify(workflow, null, 2) + '\n'
    await fs.writeFile(filePath, newContent, 'utf-8')
  }

  return { fixed: fixedCount > 0, nodeCount: fixedCount }
}

/**
 * Find all workflow files
 */
async function findWorkflowFiles(): Promise<string[]> {
  const patterns = [
    'packagerepo/backend/workflows/*.json',
    'workflow/examples/**/*.json',
    'packages/*/workflow/*.json',
  ]

  const files: string[] = []
  for (const pattern of patterns) {
    const matched = await glob(pattern, { cwd: process.cwd() })
    files.push(...matched)
  }

  return [...new Set(files)] // Remove duplicates
}

/**
 * Main function
 */
async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const cwd = process.cwd()

  console.log(`\n🔧 Fixing Workflow Parameters${dryRun ? ' (DRY RUN)' : ''}`)
  console.log(`📁 Working directory: ${cwd}\n`)

  try {
    // Find workflows
    const workflowFiles = await findWorkflowFiles()
    if (workflowFiles.length === 0) {
      console.log('⚠️  No workflow files found')
      return
    }

    console.log(`Found ${workflowFiles.length} workflow files\n`)

    let totalFixed = 0
    let totalNodes = 0
    const fixedFiles: string[] = []

    // Process each workflow
    for (const file of workflowFiles) {
      try {
        const { fixed, nodeCount } = await fixWorkflow(file, dryRun)
        if (fixed) {
          totalFixed++
          totalNodes += nodeCount
          fixedFiles.push(file)
          console.log(`✓ ${path.basename(file)}: Fixed ${nodeCount} nodes`)
        }
      } catch (error) {
        console.error(`✗ Error processing ${file}:`, error instanceof Error ? error.message : String(error))
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`Summary:`)
    console.log(`  Workflows fixed: ${totalFixed}/${workflowFiles.length}`)
    console.log(`  Total nodes fixed: ${totalNodes}`)
    console.log(`${'='.repeat(60)}`)

    if (dryRun) {
      console.log('\n📋 DRY RUN - No changes were written')
      console.log('Run without --dry-run to apply fixes\n')
    } else if (totalFixed > 0) {
      console.log('\n✅ All workflows fixed successfully!\n')
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
