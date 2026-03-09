#!/usr/bin/env tsx
/**
 * Audit script for JSON component definitions
 *
 * Goals:
 * 1. Phase out src/components TSX files
 * 2. Audit existing JSON definitions for completeness and correctness
 */

import fs from 'fs'
import path from 'path'
import { globSync } from 'fs'

interface AuditIssue {
  severity: 'error' | 'warning' | 'info'
  category: string
  file?: string
  message: string
  suggestion?: string
}

interface AuditReport {
  timestamp: string
  issues: AuditIssue[]
  stats: {
    totalJsonFiles: number
    totalTsxFiles: number
    registryEntries: number
    orphanedJson: number
    duplicates: number
    obsoleteWrapperRefs: number
  }
}

const ROOT_DIR = path.resolve(process.cwd())
const CONFIG_PAGES_DIR = path.join(ROOT_DIR, 'src/config/pages')
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src/components')
const JSON_DEFS_DIR = path.join(ROOT_DIR, 'src/components/json-definitions')
const REGISTRY_FILE = path.join(ROOT_DIR, 'json-components-registry.json')

async function loadRegistry(): Promise<any> {
  const content = fs.readFileSync(REGISTRY_FILE, 'utf-8')
  return JSON.parse(content)
}

function findAllFiles(pattern: string, cwd: string = ROOT_DIR): string[] {
  const fullPattern = path.join(cwd, pattern)
  return globSync(fullPattern, { ignore: '**/node_modules/**' })
}

function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

async function auditJsonComponents(): Promise<AuditReport> {
  const issues: AuditIssue[] = []
  const registry = await loadRegistry()

  // Find all files
  const jsonFiles = findAllFiles('src/config/pages/**/*.json')
  const tsxFiles = findAllFiles('src/components/**/*.tsx')
  const jsonDefFiles = findAllFiles('src/components/json-definitions/*.json')

  console.log(`📊 Found ${jsonFiles.length} JSON files in config/pages`)
  console.log(`📊 Found ${tsxFiles.length} TSX files in src/components`)
  console.log(`📊 Found ${jsonDefFiles.length} JSON definitions`)
  console.log(`📊 Found ${registry.components?.length || 0} registry entries\n`)

  // Build registry lookup maps
  const registryByType = new Map<string, any>()
  const registryByName = new Map<string, any>()

  if (registry.components) {
    for (const component of registry.components) {
      if (component.type) registryByType.set(component.type, component)
      if (component.name) registryByName.set(component.name, component)
    }
  }

  // Check 1: Find TSX files that have JSON equivalents in config/pages
  console.log('🔍 Checking for TSX files that could be replaced with JSON...')
  const tsxBasenames = new Set<string>()
  for (const tsxFile of tsxFiles) {
    const basename = path.basename(tsxFile, '.tsx')
    const dir = path.dirname(tsxFile)
    const category = path.basename(dir) // atoms, molecules, organisms

    if (!['atoms', 'molecules', 'organisms'].includes(category)) continue

    tsxBasenames.add(basename)
    const kebab = toKebabCase(basename)

    // Check if there's a corresponding JSON file in config/pages
    const possibleJsonPath = path.join(CONFIG_PAGES_DIR, category, `${kebab}.json`)

    if (fs.existsSync(possibleJsonPath)) {
      issues.push({
        severity: 'warning',
        category: 'duplicate-implementation',
        file: tsxFile,
        message: `TSX file has JSON equivalent at ${path.relative(ROOT_DIR, possibleJsonPath)}`,
        suggestion: `Consider removing TSX and routing through JSON renderer`
      })
    }
  }

  // Check 2: Find JSON files without registry entries
  console.log('🔍 Checking for orphaned JSON files...')
  for (const jsonFile of jsonFiles) {
    const content = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'))
    const componentType = content.type

    if (componentType && !registryByType.has(componentType)) {
      issues.push({
        severity: 'error',
        category: 'orphaned-json',
        file: jsonFile,
        message: `JSON file references type "${componentType}" which is not in registry`,
        suggestion: `Add registry entry for ${componentType} in json-components-registry.json`
      })
    }
  }

  // Check 3: Find components with obsolete wrapper references
  console.log('🔍 Checking for obsolete wrapper references...')
  for (const component of registry.components || []) {
    if (component.wrapperRequired || component.wrapperComponent) {
      issues.push({
        severity: 'warning',
        category: 'obsolete-wrapper-ref',
        file: `registry: ${component.type}`,
        message: `Component "${component.type}" has obsolete wrapperRequired/wrapperComponent fields`,
        suggestion: `Remove wrapperRequired and wrapperComponent fields - use createJsonComponentWithHooks instead`
      })
    }
  }

  // Check 4: Find components with load.path that don't exist
  console.log('🔍 Checking for broken load paths...')
  for (const component of registry.components || []) {
    if (component.load?.path) {
      const loadPath = component.load.path.replace('@/', 'src/')
      const possibleExtensions = ['.tsx', '.ts', '.jsx', '.js']
      let found = false

      for (const ext of possibleExtensions) {
        if (fs.existsSync(path.join(ROOT_DIR, loadPath + ext))) {
          found = true
          break
        }
      }

      if (!found) {
        issues.push({
          severity: 'error',
          category: 'broken-load-path',
          file: `registry: ${component.type}`,
          message: `Component "${component.type}" has load.path "${component.load.path}" but file not found`,
          suggestion: `Fix or remove load.path in registry`
        })
      }
    }
  }

  // Check 5: Components in src/components/molecules without JSON definitions
  console.log('🔍 Checking molecules without JSON definitions...')
  const moleculeTsxFiles = tsxFiles.filter(f => f.includes('/molecules/'))
  const jsonDefBasenames = new Set(
    jsonDefFiles.map(f => path.basename(f, '.json'))
  )

  for (const tsxFile of moleculeTsxFiles) {
    const basename = path.basename(tsxFile, '.tsx')
    const kebab = toKebabCase(basename)

    if (!jsonDefBasenames.has(kebab) && registryByType.has(basename)) {
      const entry = registryByType.get(basename)
      if (entry.source === 'molecules' && !entry.load?.path) {
        issues.push({
          severity: 'info',
          category: 'potential-conversion',
          file: tsxFile,
          message: `Molecule "${basename}" could potentially be converted to JSON`,
          suggestion: `Evaluate if ${basename} can be expressed as pure JSON`
        })
      }
    }
  }

  const stats = {
    totalJsonFiles: jsonFiles.length,
    totalTsxFiles: tsxFiles.length,
    registryEntries: registry.components?.length || 0,
    orphanedJson: issues.filter(i => i.category === 'orphaned-json').length,
    duplicates: issues.filter(i => i.category === 'duplicate-implementation').length,
    obsoleteWrapperRefs: issues.filter(i => i.category === 'obsolete-wrapper-ref').length
  }

  return {
    timestamp: new Date().toISOString(),
    issues,
    stats
  }
}

function printReport(report: AuditReport) {
  console.log('\n' + '='.repeat(80))
  console.log('📋 AUDIT REPORT')
  console.log('='.repeat(80))
  console.log(`\n📅 Generated: ${report.timestamp}\n`)

  console.log('📈 Statistics:')
  console.log(`   • Total JSON files: ${report.stats.totalJsonFiles}`)
  console.log(`   • Total TSX files: ${report.stats.totalTsxFiles}`)
  console.log(`   • Registry entries: ${report.stats.registryEntries}`)
  console.log(`   • Orphaned JSON: ${report.stats.orphanedJson}`)
  console.log(`   • Obsolete wrapper refs: ${report.stats.obsoleteWrapperRefs}`)
  console.log(`   • Duplicate implementations: ${report.stats.duplicates}\n`)

  // Group issues by category
  const byCategory = new Map<string, AuditIssue[]>()
  for (const issue of report.issues) {
    if (!byCategory.has(issue.category)) {
      byCategory.set(issue.category, [])
    }
    byCategory.get(issue.category)!.push(issue)
  }

  // Print issues by severity
  const severityOrder = ['error', 'warning', 'info'] as const
  const severityIcons = { error: '❌', warning: '⚠️', info: 'ℹ️' }

  for (const severity of severityOrder) {
    const issuesOfSeverity = report.issues.filter(i => i.severity === severity)
    if (issuesOfSeverity.length === 0) continue

    console.log(`\n${severityIcons[severity]} ${severity.toUpperCase()} (${issuesOfSeverity.length})`)
    console.log('-'.repeat(80))

    const categories = new Map<string, AuditIssue[]>()
    for (const issue of issuesOfSeverity) {
      if (!categories.has(issue.category)) {
        categories.set(issue.category, [])
      }
      categories.get(issue.category)!.push(issue)
    }

    for (const [category, issues] of categories) {
      console.log(`\n  ${category.replace(/-/g, ' ').toUpperCase()} (${issues.length}):`)

      for (const issue of issues.slice(0, 5)) { // Show first 5 of each category
        console.log(`    • ${issue.file || 'N/A'}`)
        console.log(`      ${issue.message}`)
        if (issue.suggestion) {
          console.log(`      💡 ${issue.suggestion}`)
        }
      }

      if (issues.length > 5) {
        console.log(`    ... and ${issues.length - 5} more`)
      }
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log(`Total issues found: ${report.issues.length}`)
  console.log('='.repeat(80) + '\n')
}

async function main() {
  console.log('🔍 Starting JSON component audit...\n')

  const report = await auditJsonComponents()

  printReport(report)

  // Write report to file
  const reportPath = path.join(ROOT_DIR, 'audit-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`📄 Full report written to: ${reportPath}\n`)

  // Exit with error code if there are errors
  const errorCount = report.issues.filter(i => i.severity === 'error').length
  if (errorCount > 0) {
    console.log(`❌ Audit failed with ${errorCount} errors`)
    process.exit(1)
  } else {
    console.log('✅ Audit completed successfully')
  }
}

main().catch(error => {
  console.error('❌ Audit failed:', error)
  process.exit(1)
})
