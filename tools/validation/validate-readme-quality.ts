import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

interface ReadmeQuality {
  file: string
  hasDescription: boolean
  hasInstallation: boolean
  hasUsage: boolean
  hasContributing: boolean
  score: number
}

function validateReadmeQuality(): ReadmeQuality[] {
  const results: ReadmeQuality[] = []
  
  try {
    const content = readFileSync('README.md', 'utf8')
    
    const checks = {
      hasDescription: content.toLowerCase().includes('description') || content.toLowerCase().includes('about'),
      hasInstallation: content.toLowerCase().includes('install'),
      hasUsage: content.toLowerCase().includes('usage') || content.toLowerCase().includes('example'),
      hasContributing: content.toLowerCase().includes('contributing') || content.toLowerCase().includes('contribute')
    }
    
    const score = (Object.values(checks).filter(v => v).length / 4) * 100
    
    results.push({
      file: 'README.md',
      ...checks,
      score
    })
  } catch (e) {
    // README not found
  }
  
  return results
}

const results = validateReadmeQuality()
console.log(JSON.stringify({
  totalChecked: results.length,
  results,
  timestamp: new Date().toISOString()
}, null, 2))
