#!/usr/bin/env tsx

import { readdirSync, readFileSync, statSync } from 'fs'
import { join, extname } from 'path'

interface DocMetrics {
  file: string
  totalFunctions: number
  documentedFunctions: number
  coverage: number
  missingDocs: string[]
}

function analyzeJSDocCoverage(): DocMetrics[] {
  const results: DocMetrics[] = []
  const srcDir = 'src'
  
  function walkDir(dir: string) {
    try {
      const files = readdirSync(dir)
      
      for (const file of files) {
        const fullPath = join(dir, file)
        const stat = statSync(fullPath)
        
        if (stat.isDirectory() && !['node_modules', '.next', 'dist', 'build'].includes(file)) {
          walkDir(fullPath)
        } else if (['.ts', '.tsx'].includes(extname(file))) {
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

function analyzeFile(filePath: string, results: DocMetrics[]): void {
  try {
    const content = readFileSync(filePath, 'utf8')
    
    // Find all exported functions, constants, and types
    const exportPattern = /(?:export\s+)?(async\s+)?(?:function|const|interface|type|class)\s+(\w+)/g
    const jsdocPattern = /\/\*\*[\s\S]*?\*\//g
    
    const jsdocs = new Set()
    let docMatch
    while ((docMatch = jsdocPattern.exec(content)) !== null) {
      // Get the next function name after this JSDoc
      const afterDoc = content.substring(docMatch.index + docMatch[0].length)
      const nextFunc = afterDoc.match(/(?:async\s+)?(?:function|const|interface|type|class)\s+(\w+)/)?.[1]
      if (nextFunc) {
        jsdocs.add(nextFunc)
      }
    }
    
    const functions: string[] = []
    let match
    while ((match = exportPattern.exec(content)) !== null) {
      functions.push(match[2])
    }
    
    const metrics: DocMetrics = {
      file: filePath,
      totalFunctions: functions.length,
      documentedFunctions: Array.from(jsdocs).filter(doc => functions.includes(doc as string)).length,
      coverage: functions.length > 0 ? (Array.from(jsdocs).filter(doc => functions.includes(doc as string)).length / functions.length) * 100 : 100,
      missingDocs: functions.filter(f => !jsdocs.has(f))
    }
    
    // Only report files with missing documentation
    if (metrics.missingDocs.length > 0) {
      results.push(metrics)
    }
  } catch (e) {
    // Skip files that can't be analyzed
  }
}

// Main execution
const results = analyzeJSDocCoverage()

const summary = {
  totalFiles: results.length,
  filesWithGaps: results.filter(r => r.coverage < 100).length,
  averageCoverage: results.length > 0 
    ? (results.reduce((sum, r) => sum + r.coverage, 0) / results.length)
    : 100,
  totalMissingDocs: results.reduce((sum, r) => sum + r.missingDocs.length, 0),
  details: results,
  timestamp: new Date().toISOString()
}

console.log(JSON.stringify(summary, null, 2))
