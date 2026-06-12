/**
 * Architecture component analysis helpers
 */

import { ComponentMetrics, OversizedComponent } from '../types/index.js'
import { getLineCount, normalizeFilePath } from '../utils/fileSystem.js'

function extractComponentName(filePath: string): string {
  const parts = filePath.split('/')
  return parts[parts.length - 1].replace(/\.(tsx?|jsx?)$/, '')
}

function classifyComponent(filePath: string): string {
  if (filePath.includes('/atoms/')) return 'atom'
  if (filePath.includes('/molecules/')) return 'molecule'
  if (filePath.includes('/organisms/')) return 'organism'
  if (filePath.includes('/templates/')) return 'template'
  return 'unknown'
}

/**
 * Analyze component organization from file paths
 */
export function analyzeComponents(filePaths: string[]): ComponentMetrics {
  const componentFiles: string[] = []
  const oversized: OversizedComponent[] = []

  for (const filePath of filePaths) {
    if (
      !filePath.includes('/components/') ||
      (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts'))
    )
      continue

    componentFiles.push(filePath)

    const lines = getLineCount(filePath)
    if (lines > 500) {
      oversized.push({
        file: normalizeFilePath(filePath),
        name: extractComponentName(filePath),
        lines,
        type: classifyComponent(filePath) as any,
        suggestion:
          'Split into smaller components or extract logic to utilities',
      })
    }
  }

  const byType = {
    atoms: filePaths.filter(f => f.includes('/atoms/')).length,
    molecules: filePaths.filter(f => f.includes('/molecules/')).length,
    organisms: filePaths.filter(f => f.includes('/organisms/')).length,
    templates: filePaths.filter(f => f.includes('/templates/')).length,
    unknown:
      componentFiles.length -
      filePaths.filter(f => f.includes('/atoms/')).length -
      filePaths.filter(f => f.includes('/molecules/')).length -
      filePaths.filter(f => f.includes('/organisms/')).length -
      filePaths.filter(f => f.includes('/templates/')).length,
  }

  const avgSize =
    componentFiles.length > 0
      ? componentFiles.reduce((sum, f) => sum + getLineCount(f), 0) /
        componentFiles.length
      : 0

  return {
    totalCount: componentFiles.length,
    byType,
    oversized: oversized.slice(0, 10),
    misplaced: [],
    averageSize: Math.round(avgSize),
  }
}
