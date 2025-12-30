import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

interface TSIgnore {
  file: string
  line: number
  reason: string
}

function findTSIgnores(): TSIgnore[] {
  const results: TSIgnore[] = []
  
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
            if (line.includes('@ts-ignore') || line.includes('@ts-nocheck')) {
              results.push({
                file: fullPath,
                line: idx + 1,
                reason: line.match(/\/\/.*@ts-.*?(.*?)$/)?.[1] || 'No reason given'
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

const results = findTSIgnores()
console.log(JSON.stringify({
  totalIgnores: results.length,
  ignores: results,
  timestamp: new Date().toISOString()
}, null, 2))
