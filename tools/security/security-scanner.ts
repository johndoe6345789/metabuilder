#!/usr/bin/env tsx

import { readdirSync, readFileSync, statSync } from 'fs'
import { join, extname } from 'path'

interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low'
  file: string
  line: number
  issue: string
  pattern: string
}

const SECURITY_PATTERNS = [
  {
    name: 'eval usage',
    pattern: /eval\s*\(/g,
    severity: 'critical' as const,
    description: 'eval() can execute arbitrary code'
  },
  {
    name: 'innerHTML assignment',
    pattern: /\.innerHTML\s*=/g,
    severity: 'high' as const,
    description: 'innerHTML is vulnerable to XSS. Use textContent or sanitize input'
  },
  {
    name: 'dangerouslySetInnerHTML',
    pattern: /dangerouslySetInnerHTML/g,
    severity: 'high' as const,
    description: 'Ensure the content is properly sanitized'
  },
  {
    name: 'hardcoded credentials',
    pattern: /(password|secret|token|apiKey|api_key)\s*[:=]\s*['"][\w-]+['"]/gi,
    severity: 'critical' as const,
    description: 'Potential hardcoded credentials detected'
  },
  {
    name: 'SQL injection risk',
    pattern: /\$\{.*\}|`.*\+.*`/g,
    severity: 'high' as const,
    description: 'Potential SQL injection via string interpolation'
  },
  {
    name: 'unvalidated fetch',
    pattern: /fetch\s*\(\s*[^'"]/g,
    severity: 'medium' as const,
    description: 'Fetch with non-string URL could be unsafe'
  },
  {
    name: 'missing input validation',
    pattern: /\.value|\.text(?!Content)/g,
    severity: 'medium' as const,
    description: 'User input should be validated'
  },
  {
    name: 'missing CORS headers',
    pattern: /(res\.|response\.).*header|setHeader/g,
    severity: 'medium' as const,
    description: 'Consider CORS security headers'
  }
]

function scanFiles(): SecurityIssue[] {
  const issues: SecurityIssue[] = []
  const srcDir = 'src'
  
  function walkDir(dir: string) {
    try {
      const files = readdirSync(dir)
      
      for (const file of files) {
        const fullPath = join(dir, file)
        const stat = statSync(fullPath)
        
        if (stat.isDirectory() && !['node_modules', '.next', 'dist', 'build'].includes(file)) {
          walkDir(fullPath)
        } else if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(file))) {
          scanFile(fullPath, issues)
        }
      }
    } catch (e) {
      // Skip inaccessible directories
    }
  }
  
  walkDir(srcDir)
  return issues
}

function scanFile(filePath: string, issues: SecurityIssue[]) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    for (const patternConfig of SECURITY_PATTERNS) {
      let match
      const pattern = new RegExp(patternConfig.pattern.source, 'g')
      
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length
        
        // Skip if in comment
        const line = lines[lineNumber - 1]
        const commentStart = line.indexOf('//')
        const matchPosition = match.index - content.substring(0, match.index).lastIndexOf('\n') - 1
        
        if (commentStart >= 0 && matchPosition > commentStart) {
          continue
        }
        
        issues.push({
          severity: patternConfig.severity,
          file: filePath,
          line: lineNumber,
          issue: patternConfig.description,
          pattern: patternConfig.name
        })
      }
    }
  } catch (e) {
    // Skip files that can't be read
  }
}

// Main execution
const issues = scanFiles()

const summary = {
  totalIssues: issues.length,
  critical: issues.filter(i => i.severity === 'critical').length,
  high: issues.filter(i => i.severity === 'high').length,
  medium: issues.filter(i => i.severity === 'medium').length,
  low: issues.filter(i => i.severity === 'low').length,
  issues: issues.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  }),
  timestamp: new Date().toISOString()
}

console.log(JSON.stringify(summary, null, 2))

// Exit with error if critical issues found
if (summary.critical > 0) {
  process.exit(1)
}
