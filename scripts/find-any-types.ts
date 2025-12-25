import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

interface AnyTypeUsage {
  file: string
  line: number
  context: string
}

function findAnyTypes(): AnyTypeUsage[] {
  const results: AnyTypeUsage[] = []
  
  function walkDir(dir: string) {
    try {
      const files = readdirSync(dir)
      for (const file of files) {
        const fullPath = join(dir, file)
        const stat = require('fs').statSync(fullPath)
        if (stat.isDirectory() && !['node_modules', '.next', 'build'].includes(file)) {
          walkDir(fullPath)
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
          const content = readFileSync(fullPath, 'utf8')
          const lines = content.split('\n')
          lines.forEach((line, idx) => {
            if (line.includes(': any') || line.match(/as\s+any\b/)) {
              results.push({
                file: fullPath,
                line: idx + 1,
                context: line.trim()
              })
            }
          })
        }
      }
    } catch (e) {
      // Skip
    }
  }
  
  walkDir('src')
  return results
}

const results = findAnyTypes()
console.log(JSON.stringify({
  totalAnyUsages: results.length,
  usages: results.slice(0, 50),
  timestamp: new Date().toISOString()
}, null, 2))
