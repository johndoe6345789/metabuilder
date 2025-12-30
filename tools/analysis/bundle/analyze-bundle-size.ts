#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { readFileSync } from 'fs'

interface BundleAnalysis {
  entrypoint: string
  size: number
  gzipSize: number
  percentOfTotal: number
  chunks: Array<{
    name: string
    size: number
  }>
  recommendations: string[]
}

async function analyzeBundleSize(): Promise<BundleAnalysis> {
  try {
    // Try to get webpack-bundle-analyzer output if available
    const output = execSync('ls -lh .next/static/chunks/*.js 2>/dev/null | head -20', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim()
    
    const recommendations: string[] = []
    let totalSize = 0
    const chunks: Array<{ name: string; size: number }> = []
    
    // Parse webpack output
    const lines = output.split('\n').filter(l => l)
    for (const line of lines) {
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 9) {
        const size = parseFileSize(parts[4])
        const name = parts[8]
        chunks.push({ name: name.replace(/.*\//, ''), size })
        totalSize += size
      }
    }
    
    // Generate recommendations
    if (totalSize > 1024 * 1024) {
      recommendations.push('Total bundle size exceeds 1MB. Consider code splitting.')
    }
    
    const largestChunk = chunks.sort((a, b) => b.size - a.size)[0]
    if (largestChunk && largestChunk.size > 500 * 1024) {
      recommendations.push(`Largest chunk (${largestChunk.name}) exceeds 500KB. Consider splitting further.`)
    }
    
    chunks.forEach(chunk => {
      if (chunk.size > 300 * 1024) {
        recommendations.push(`Chunk ${chunk.name} is ${(chunk.size / 1024).toFixed(0)}KB. Consider optimizing.`)
      }
    })
    
    return {
      entrypoint: 'main',
      size: totalSize,
      gzipSize: Math.round(totalSize * 0.3), // Rough estimate
      percentOfTotal: 100,
      chunks,
      recommendations
    }
  } catch (e) {
    return {
      entrypoint: 'main',
      size: 0,
      gzipSize: 0,
      percentOfTotal: 0,
      chunks: [],
      recommendations: ['Unable to analyze bundle. Ensure next build has completed.']
    }
  }
}

function parseFileSize(sizeStr: string): number {
  const units: { [key: string]: number } = { K: 1024, M: 1024 * 1024, G: 1024 * 1024 * 1024 }
  const match = sizeStr.match(/^([\d.]+)([KMG])?/)
  if (!match) return 0
  const value = parseFloat(match[1])
  const unit = match[2] || 'B'
  return Math.round(value * (units[unit] || 1))
}

// Main execution
(async () => {
  const analysis = await analyzeBundleSize()
  
  const summary = {
    totalBundleSize: {
      bytes: analysis.size,
      kb: (analysis.size / 1024).toFixed(2),
      mb: (analysis.size / (1024 * 1024)).toFixed(2)
    },
    gzipSize: {
      bytes: analysis.gzipSize,
      kb: (analysis.gzipSize / 1024).toFixed(2),
      mb: (analysis.gzipSize / (1024 * 1024)).toFixed(2)
    },
    chunks: analysis.chunks.map(c => ({
      name: c.name,
      size: {
        bytes: c.size,
        kb: (c.size / 1024).toFixed(2)
      }
    })),
    recommendations: analysis.recommendations,
    budgetStatus: {
      maxRecommended: '500KB',
      currentTotal: `${(analysis.size / 1024).toFixed(0)}KB`,
      status: analysis.size > 512 * 1024 ? 'warning' : 'ok'
    },
    timestamp: new Date().toISOString()
  }
  
  console.log(JSON.stringify(summary, null, 2))
})()
