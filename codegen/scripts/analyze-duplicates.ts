#!/usr/bin/env tsx
/**
 * Analyze duplicate TSX files before deletion
 * Check JSON contents to ensure they're complete
 */

import fs from 'fs'
import path from 'path'
import { globSync } from 'fs'

const ROOT_DIR = path.resolve(process.cwd())
const CONFIG_PAGES_DIR = path.join(ROOT_DIR, 'src/config/pages')
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src/components')
const JSON_DEFS_DIR = path.join(ROOT_DIR, 'src/components/json-definitions')

function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}

interface AnalysisResult {
  tsx: string
  json: string
  tsxSize: number
  jsonSize: number
  tsxHasHooks: boolean
  tsxHasState: boolean
  tsxHasEffects: boolean
  jsonHasBindings: boolean
  jsonHasChildren: boolean
  recommendation: 'safe-to-delete' | 'needs-review' | 'keep-tsx'
  reason: string
}

async function analyzeTsxFile(filePath: string): Promise<{
  hasHooks: boolean
  hasState: boolean
  hasEffects: boolean
}> {
  const content = fs.readFileSync(filePath, 'utf-8')

  return {
    hasHooks: /use[A-Z]/.test(content),
    hasState: /useState|useReducer/.test(content),
    hasEffects: /useEffect|useLayoutEffect/.test(content)
  }
}

async function analyzeJsonFile(filePath: string): Promise<{
  hasBindings: boolean
  hasChildren: boolean
  size: number
}> {
  const content = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(content)

  return {
    hasBindings: !!json.bindings || hasNestedBindings(json),
    hasChildren: !!json.children,
    size: content.length
  }
}

function hasNestedBindings(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false
  if (obj.bindings) return true

  for (const key in obj) {
    if (hasNestedBindings(obj[key])) return true
  }
  return false
}

async function analyzeDuplicates() {
  console.log('🔍 Analyzing duplicate TSX files...\n')

  const results: AnalysisResult[] = []

  // Find all TSX files in atoms, molecules, organisms
  const categories = ['atoms', 'molecules', 'organisms']

  for (const category of categories) {
    const tsxFiles = globSync(path.join(COMPONENTS_DIR, category, '*.tsx'))

    for (const tsxFile of tsxFiles) {
      const basename = path.basename(tsxFile, '.tsx')
      const kebab = toKebabCase(basename)

      // Check for JSON equivalent in config/pages
      const jsonPath = path.join(CONFIG_PAGES_DIR, category, `${kebab}.json`)

      if (!fs.existsSync(jsonPath)) continue

      // Check for JSON definition
      const jsonDefPath = path.join(JSON_DEFS_DIR, `${kebab}.json`)

      // Analyze both files
      const tsxAnalysis = await analyzeTsxFile(tsxFile)
      const tsxSize = fs.statSync(tsxFile).size

      let jsonAnalysis = { hasBindings: false, hasChildren: false, size: 0 }
      let actualJsonPath = jsonPath

      if (fs.existsSync(jsonDefPath)) {
        jsonAnalysis = await analyzeJsonFile(jsonDefPath)
        actualJsonPath = jsonDefPath
      } else if (fs.existsSync(jsonPath)) {
        jsonAnalysis = await analyzeJsonFile(jsonPath)
      }

      // Determine recommendation
      let recommendation: AnalysisResult['recommendation'] = 'safe-to-delete'
      let reason = 'JSON definition exists'

      if (tsxAnalysis.hasState || tsxAnalysis.hasEffects) {
        if (!jsonAnalysis.hasBindings && jsonAnalysis.size < 500) {
          recommendation = 'needs-review'
          reason = 'TSX has state/effects but JSON seems incomplete'
        } else {
          recommendation = 'safe-to-delete'
          reason = 'TSX has hooks but JSON should handle via createJsonComponentWithHooks'
        }
      }

      if (tsxSize > 5000 && jsonAnalysis.size < 1000) {
        recommendation = 'needs-review'
        reason = 'TSX is large but JSON is small - might be missing content'
      }

      results.push({
        tsx: path.relative(ROOT_DIR, tsxFile),
        json: path.relative(ROOT_DIR, actualJsonPath),
        tsxSize,
        jsonSize: jsonAnalysis.size,
        tsxHasHooks: tsxAnalysis.hasHooks,
        tsxHasState: tsxAnalysis.hasState,
        tsxHasEffects: tsxAnalysis.hasEffects,
        jsonHasBindings: jsonAnalysis.hasBindings,
        jsonHasChildren: jsonAnalysis.hasChildren,
        recommendation,
        reason
      })
    }
  }

  // Print results
  console.log(`📊 Found ${results.length} duplicate components\n`)

  const safeToDelete = results.filter(r => r.recommendation === 'safe-to-delete')
  const needsReview = results.filter(r => r.recommendation === 'needs-review')
  const keepTsx = results.filter(r => r.recommendation === 'keep-tsx')

  console.log(`✅ Safe to delete: ${safeToDelete.length}`)
  console.log(`⚠️  Needs review: ${needsReview.length}`)
  console.log(`🔴 Keep TSX: ${keepTsx.length}\n`)

  if (needsReview.length > 0) {
    console.log('⚠️  NEEDS REVIEW:')
    console.log('='.repeat(80))
    for (const result of needsReview.slice(0, 10)) {
      console.log(`\n${result.tsx}`)
      console.log(`  → ${result.json}`)
      console.log(`  TSX: ${result.tsxSize} bytes | JSON: ${result.jsonSize} bytes`)
      console.log(`  TSX hooks: ${result.tsxHasHooks} | state: ${result.tsxHasState} | effects: ${result.tsxHasEffects}`)
      console.log(`  JSON bindings: ${result.jsonHasBindings} | children: ${result.jsonHasChildren}`)
      console.log(`  Reason: ${result.reason}`)
    }
    if (needsReview.length > 10) {
      console.log(`\n... and ${needsReview.length - 10} more`)
    }
  }

  // Write full report
  const reportPath = path.join(ROOT_DIR, 'duplicate-analysis.json')
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
  console.log(`\n📄 Full report written to: ${reportPath}`)

  // Generate deletion script for safe components
  if (safeToDelete.length > 0) {
    const deletionScript = safeToDelete.map(r => `rm "${r.tsx}"`).join('\n')
    const scriptPath = path.join(ROOT_DIR, 'delete-duplicates.sh')
    fs.writeFileSync(scriptPath, deletionScript)
    console.log(`📝 Deletion script written to: ${scriptPath}`)
    console.log(`   Run: bash delete-duplicates.sh`)
  }
}

analyzeDuplicates().catch(error => {
  console.error('❌ Analysis failed:', error)
  process.exit(1)
})
