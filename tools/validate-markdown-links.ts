import { readdirSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'

interface LinkValidation {
  file: string
  brokenLinks: Array<{ link: string; line: number }>
}

function findMarkdownFiles(dir: string = '.'): string[] {
  const files: string[] = []
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      if (['node_modules', '.git', 'build', 'dist', '.next'].includes(entry)) continue
      const path = join(dir, entry)
      const stat = require('fs').statSync(path)
      if (stat.isDirectory()) {
        files.push(...findMarkdownFiles(path))
      } else if (entry.endsWith('.md')) {
        files.push(path)
      }
    }
  } catch (e) {
    // Skip
  }
  return files
}

function validateLinks(): LinkValidation[] {
  const results: LinkValidation[] = []
  const mdFiles = findMarkdownFiles()
  
  for (const file of mdFiles) {
    try {
      const content = readFileSync(file, 'utf8')
      const linkPattern = /\[.*?\]\((.*?)\)/g
      const brokenLinks: Array<{ link: string; line: number }> = []
      
      let match
      while ((match = linkPattern.exec(content)) !== null) {
        const link = match[1]
        if (!link.startsWith('http') && !link.startsWith('#')) {
          const targetPath = join(dirname(file), link.split('#')[0])
          if (link.split('#')[0] && !existsSync(targetPath)) {
            const line = content.substring(0, match.index).split('\n').length
            brokenLinks.push({ link, line })
          }
        }
      }
      
      if (brokenLinks.length > 0) {
        results.push({ file, brokenLinks })
      }
    } catch (e) {
      // Skip
    }
  }
  
  return results
}

const results = validateLinks()
console.log(JSON.stringify({
  filesChecked: findMarkdownFiles().length,
  filesWithBrokenLinks: results.length,
  details: results,
  timestamp: new Date().toISOString()
}, null, 2))
