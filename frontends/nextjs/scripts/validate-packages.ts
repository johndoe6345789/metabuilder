#!/usr/bin/env node
/**
 * Package Validator CLI
 * 
 * Validates MetaBuilder packages for compliance with the package structure standard.
 * Checks metadata.json, components.json, Lua scripts, and folder structure.
 * 
 * Usage:
 *   npx tsx scripts/validate-packages.ts [package-name] [--all] [--json]
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Dirent } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================================================
// Types
// ============================================================================

interface PackageMetadata {
  packageId: string
  name: string
  version: string
  description: string
  author: string
  category: string
  dependencies?: string[]
  devDependencies?: string[]
  minLevel?: number
  exports?: {
    scripts?: Record<string, string>
    components?: string[]
  }
}

interface ValidationResult {
  packageId: string
  valid: boolean
  errors: string[]
  warnings: string[]
}

interface ComponentDefinition {
  id: string
  type: string
  props?: Record<string, unknown>
  children?: ComponentDefinition[]
}

// ============================================================================
// Validation Functions
// ============================================================================

function validateMetadataJson(seedPath: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const metadataPath = path.join(seedPath, 'metadata.json')

  if (!fs.existsSync(metadataPath)) {
    errors.push('metadata.json not found')
    return { valid: false, errors, warnings }
  }

  try {
    const content = fs.readFileSync(metadataPath, 'utf-8')
    const metadata: PackageMetadata = JSON.parse(content)

    // Required fields
    const requiredFields = ['packageId', 'name', 'version', 'description', 'author', 'category']
    for (const field of requiredFields) {
      if (!(field in metadata)) {
        errors.push(`Missing required field: ${field}`)
      }
    }

    // Validate packageId format (snake_case)
    if (metadata.packageId && !/^[a-z][a-z0-9_]*$/.test(metadata.packageId)) {
      errors.push(`packageId "${metadata.packageId}" must be snake_case`)
    }

    // Validate version format (semver)
    if (metadata.version && !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(metadata.version)) {
      warnings.push(`version "${metadata.version}" should follow semver format`)
    }

    // Validate minLevel range
    if (metadata.minLevel !== undefined && (metadata.minLevel < 0 || metadata.minLevel > 6)) {
      errors.push(`minLevel ${metadata.minLevel} must be between 0 and 6`)
    }

    // Validate dependencies are arrays
    if (metadata.dependencies && !Array.isArray(metadata.dependencies)) {
      errors.push('dependencies must be an array')
    }

    if (metadata.devDependencies && !Array.isArray(metadata.devDependencies)) {
      errors.push('devDependencies must be an array')
    }

  } catch (e) {
    errors.push(`Failed to parse metadata.json: ${e instanceof Error ? e.message : String(e)}`)
  }

  return { valid: errors.length === 0, errors, warnings }
}

function validateComponentsJson(seedPath: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const componentsPath = path.join(seedPath, 'components.json')

  if (!fs.existsSync(componentsPath)) {
    // components.json is optional
    warnings.push('components.json not found (optional)')
    return { valid: true, errors, warnings }
  }

  try {
    const content = fs.readFileSync(componentsPath, 'utf-8')
    const components: ComponentDefinition[] = JSON.parse(content)

    if (!Array.isArray(components)) {
      errors.push('components.json must be an array')
      return { valid: false, errors, warnings }
    }

    for (let i = 0; i < components.length; i++) {
      const comp = components[i]
      if (!comp.id) {
        errors.push(`Component at index ${i} missing required field: id`)
      }
      if (!comp.type) {
        errors.push(`Component at index ${i} missing required field: type`)
      }
    }

  } catch (e) {
    errors.push(`Failed to parse components.json: ${e instanceof Error ? e.message : String(e)}`)
  }

  return { valid: errors.length === 0, errors, warnings }
}

function validateFolderStructure(seedPath: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for scripts folder
  const scriptsPath = path.join(seedPath, 'scripts')
  if (!fs.existsSync(scriptsPath)) {
    warnings.push('scripts/ folder not found (recommended)')
  } else {
    // Check for types.lua
    const typesPath = path.join(scriptsPath, 'types.lua')
    if (!fs.existsSync(typesPath)) {
      warnings.push('scripts/types.lua not found (recommended for type definitions)')
    }

    // Check for tests folder
    const testsPath = path.join(scriptsPath, 'tests')
    if (!fs.existsSync(testsPath)) {
      warnings.push('scripts/tests/ folder not found (recommended for tests)')
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

function validateLuaFiles(seedPath: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  const scriptsPath = path.join(seedPath, 'scripts')
  if (!fs.existsSync(scriptsPath)) {
    return { valid: true, errors, warnings }
  }

  function checkLuaFiles(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        checkLuaFiles(fullPath)
      } else if (entry.name.endsWith('.lua')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8')
          
          // Check for return statement (module pattern)
          if (!content.includes('return ')) {
            warnings.push(`${path.relative(seedPath, fullPath)}: No return statement (may not export correctly)`)
          }

          // Check for dangerous patterns
          if (content.includes('os.execute') || content.includes('io.popen')) {
            errors.push(`${path.relative(seedPath, fullPath)}: Contains dangerous system call`)
          }

          // Check for require without pcall for optional deps
          const requireMatches = content.match(/require\s*\([^)]+\)/g)
          if (requireMatches && requireMatches.length > 5) {
            warnings.push(`${path.relative(seedPath, fullPath)}: Many require statements (${requireMatches.length}), consider splitting`)
          }

        } catch (e) {
          errors.push(`Failed to read ${path.relative(seedPath, fullPath)}: ${e instanceof Error ? e.message : String(e)}`)
        }
      }
    }
  }

  checkLuaFiles(scriptsPath)

  return { valid: errors.length === 0, errors, warnings }
}

// ============================================================================
// Main Validation
// ============================================================================

function validatePackage(packageName: string, packagesDir: string): ValidationResult {
  const packagePath = path.join(packagesDir, packageName)
  const seedPath = path.join(packagePath, 'seed')
  
  const result: ValidationResult = {
    packageId: packageName,
    valid: true,
    errors: [],
    warnings: []
  }

  // Check package exists
  if (!fs.existsSync(packagePath)) {
    result.valid = false
    result.errors.push(`Package directory not found: ${packagePath}`)
    return result
  }

  if (!fs.existsSync(seedPath)) {
    result.valid = false
    result.errors.push('seed/ directory not found')
    return result
  }

  // Run all validations
  const validators = [
    validateMetadataJson,
    validateComponentsJson,
    validateFolderStructure,
    validateLuaFiles,
  ]

  for (const validator of validators) {
    const { valid, errors, warnings } = validator(seedPath)
    if (!valid) {
      result.valid = false
    }
    result.errors.push(...errors)
    result.warnings.push(...warnings)
  }

  return result
}

function getAllPackages(packagesDir: string): string[] {
  if (!fs.existsSync(packagesDir)) {
    return []
  }

  return fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .filter(entry => fs.existsSync(path.join(packagesDir, entry.name, 'seed')))
    .map(entry => entry.name)
    .sort()
}

function formatResults(results: ValidationResult[], jsonOutput: boolean): string {
  if (jsonOutput) {
    return JSON.stringify(results, null, 2)
  }

  const lines: string[] = []
  let totalPassed = 0
  let totalFailed = 0

  for (const result of results) {
    const status = result.valid ? '✅' : '❌'
    lines.push(`${status} ${result.packageId}`)

    if (result.errors.length > 0) {
      for (const error of result.errors) {
        lines.push(`   ❌ ${error}`)
      }
    }

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        lines.push(`   ⚠️  ${warning}`)
      }
    }

    if (result.valid) {
      totalPassed++
    } else {
      totalFailed++
    }

    lines.push('')
  }

  lines.push('─'.repeat(50))
  lines.push(`📊 Summary: ${totalPassed} passed, ${totalFailed} failed out of ${results.length} packages`)

  if (totalFailed === 0) {
    lines.push('🎉 All packages validated successfully!')
  }

  return lines.join('\n')
}

// ============================================================================
// CLI Entry Point
// ============================================================================

function main() {
  const args = process.argv.slice(2)
  const jsonOutput = args.includes('--json')
  const validateAll = args.includes('--all')
  const packageName = args.find(arg => !arg.startsWith('--'))

  // Determine packages directory (relative to script location)
  const scriptDir = __dirname
  const packagesDir = path.resolve(scriptDir, '../../packages')

  if (!fs.existsSync(packagesDir)) {
    console.error(`Packages directory not found: ${packagesDir}`)
    process.exit(2)
  }

  let results: ValidationResult[]

  if (validateAll || !packageName) {
    const packages = getAllPackages(packagesDir)
    console.error(`🔍 Validating ${packages.length} packages...\n`)
    results = packages.map(pkg => validatePackage(pkg, packagesDir))
  } else {
    results = [validatePackage(packageName, packagesDir)]
  }

  console.log(formatResults(results, jsonOutput))

  const hasFailures = results.some(r => !r.valid)
  process.exit(hasFailures ? 1 : 0)
}

main()
