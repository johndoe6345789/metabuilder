import { PageUISchema } from './schema'
import { z } from 'zod'

export interface ValidationResult {
  valid: boolean
  errors: Array<{
    path: string
    message: string
  }>
  warnings: Array<{
    path: string
    message: string
  }>
}

export function validateJSONUI(config: any): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  try {
    PageUISchema.parse(config)
  } catch (err) {
    result.valid = false
    if (err instanceof z.ZodError) {
      result.errors = err.issues.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      }))
    } else {
      result.errors.push({
        path: 'root',
        message: String(err),
      })
    }
  }

  checkForWarnings(config, result)

  return result
}

function checkForWarnings(config: any, result: ValidationResult) {
  if (!config) return

  if (!config.id) {
    result.warnings.push({
      path: 'root',
      message: 'Missing id field at root level',
    })
  }

  if (config.layout) {
    checkComponentTree(config.layout, 'layout', result, new Set())
  }

  if (config.dataSources) {
    checkDataSources(config.dataSources, result)
  }
}

function checkComponentTree(
  component: any,
  path: string,
  result: ValidationResult,
  seenIds: Set<string>
) {
  if (!component) return

  if (!component.id) {
    result.warnings.push({
      path,
      message: 'Component missing id field',
    })
  } else if (seenIds.has(component.id)) {
    result.warnings.push({
      path,
      message: `Duplicate component id: ${component.id}`,
    })
  } else {
    seenIds.add(component.id)
  }

  if (component.dataBinding) {
    const bindingPath = typeof component.dataBinding === 'string'
      ? component.dataBinding.split('.')[0]
      : component.dataBinding.source?.split('.')[0]

    if (bindingPath) {
      result.warnings.push({
        path: `${path}.${component.id}`,
        message: `Data binding references '${bindingPath}' - ensure this data source exists`,
      })
    }
  }

  if (component.children) {
    if (Array.isArray(component.children)) {
      component.children.forEach((child: any, index: number) => {
        checkComponentTree(child, `${path}.children[${index}]`, result, seenIds)
      })
    }
  }
}

function checkDataSources(dataSources: any, result: ValidationResult) {
  Object.entries(dataSources).forEach(([key, source]: [string, any]) => {
    if (source.type === 'api' && !source.config?.url) {
      result.warnings.push({
        path: `dataSources.${key}`,
        message: 'API data source missing url configuration',
      })
    }

    if (source.type === 'kv' && !source.config?.key) {
      result.warnings.push({
        path: `dataSources.${key}`,
        message: 'KV data source missing key configuration',
      })
    }
  })
}

export function prettyPrintValidation(result: ValidationResult): string {
  const lines: string[] = []

  if (result.valid && result.warnings.length === 0) {
    lines.push('✅ JSON UI configuration is valid')
    return lines.join('\n')
  }

  if (result.errors.length > 0) {
    lines.push('❌ Validation Errors:')
    result.errors.forEach(error => {
      lines.push(`  ${error.path}: ${error.message}`)
    })
    lines.push('')
  }

  if (result.warnings.length > 0) {
    lines.push('⚠️  Warnings:')
    result.warnings.forEach(warning => {
      lines.push(`  ${warning.path}: ${warning.message}`)
    })
  }

  return lines.join('\n')
}
