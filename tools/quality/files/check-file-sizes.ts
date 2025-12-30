#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

interface FileSizeMetric {
  file: string
  size: number
  lines: number
  category: 'component' | 'utility' | 'hook' | 'type' | 'style' | 'other'
  violations: string[]
}

const MAX_FILE_SIZE = 500 // lines
const MAX_COMPONENT_SIZE = 300 // lines
const MAX_UTILITY_SIZE = 200 // lines
const WARN_FILE_SIZE = 400 // lines

function categorizeFile(filePath: string): FileSizeMetric['category'] {
  if (filePath.includes('component') || filePath.endsWith('.tsx')) return 'component'
  if (filePath.includes('hook')) return 'hook'
  if (filePath.includes('type') || filePath.endsWith('.d.ts')) return 'type'
  if (filePath.includes('style') || filePath.endsWith('.css')) return 'style'
  if (filePath.includes('util') || filePath.endsWith('.ts')) return 'utility'
  return 'other'
}

function analyzeFileSizes(): FileSizeMetric[] {
  const results: FileSizeMetric[] = []
  const srcDir = 'src'
  
  function walkDir(dir: string) {
    try {
      const files = readdirSync(dir)
      
      for (const file of files) {
        const fullPath = join(dir, file)
        const stat = statSync(fullPath)
        
        if (stat.isDirectory() && !['node_modules', '.next', 'dist', 'build'].includes(file)) {
          walkDir(fullPath)
        } else if (['.ts', '.tsx', '.css'].includes(fullPath.slice(-3))) {
          analyzeFile(fullPath, results)
        }
      }
    } catch (e) {
      // Skip inaccessible directories
    }
  }
  
  walkDir(srcDir)
  return results
}

function analyzeFile(filePath: string, results: FileSizeMetric[]): void {
  try {
    const content = readFileSync(filePath, 'utf8')
    const lines = content.split('\n').length
    const size = Buffer.byteLength(content, 'utf8')
    const category = categorizeFile(filePath)
    
    const violations: string[] = []
    
    // Check size limits based on category
    const maxLines = category === 'component' ? MAX_COMPONENT_SIZE : 
                    category === 'utility' ? MAX_UTILITY_SIZE : 
                    MAX_FILE_SIZE
    
    if (lines > maxLines) {
      violations.push(`Exceeds maximum ${category} size: ${lines} lines (max: ${maxLines})`)
    } else if (lines > WARN_FILE_SIZE) {
      violations.push(`Large file: ${lines} lines (warning threshold: ${WARN_FILE_SIZE})`)
    }
    
    // Check for excessively long functions
    const functions = content.match(/(?:function|const|export|async)\s+\w+.*{[\s\S]*?^}/gm) || []
    for (const func of functions) {
      const funcLines = func.split('\n').length
      if (funcLines > 50) {
        violations.push(`Function exceeds 50 lines (${funcLines} lines)`)
      }
    }
    
    if (violations.length > 0) {
      results.push({
        file: filePath,
        size,
        lines,
        category,
        violations
      })
    }
  } catch (e) {
    // Skip files that can't be analyzed
  }
}

// Main execution
const results = analyzeFileSizes()

const summary = {
  totalFilesAnalyzed: results.length,
  violatingFiles: results.length,
  totalViolations: results.reduce((sum, r) => sum + r.violations.length, 0),
  byCategory: {
    component: results.filter(r => r.category === 'component').length,
    hook: results.filter(r => r.category === 'hook').length,
    utility: results.filter(r => r.category === 'utility').length,
    type: results.filter(r => r.category === 'type').length,
    style: results.filter(r => r.category === 'style').length,
  },
  largestFiles: results.sort((a, b) => b.lines - a.lines).slice(0, 10),
  details: results,
  timestamp: new Date().toISOString()
}

console.log(JSON.stringify(summary, null, 2))
