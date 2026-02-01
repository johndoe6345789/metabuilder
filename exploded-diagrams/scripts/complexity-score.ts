#!/usr/bin/env npx tsx
import { readFileSync } from 'fs'

interface Geometry3D {
  type: string
  subtract?: boolean
  intersect?: boolean
  offsetX?: number
  offsetY?: number
  offsetZ?: number
  fill?: string
  [key: string]: unknown
}

function complexityScore(filePath: string): { score: number; breakdown: Record<string, number>; warnings: string[] } {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const geoms: Geometry3D[] = data.geometry3d || []

  const breakdown: Record<string, number> = {}
  const warnings: string[] = []
  let score = 0

  // Base score for primitive count (5 pts each, max 50)
  const primitiveScore = Math.min(geoms.length * 5, 50)
  breakdown['primitives'] = primitiveScore
  score += primitiveScore

  // Bonus for variety of types (10 pts each, max 40)
  const types = new Set(geoms.map(g => g.type))
  const varietyScore = Math.min(types.size * 10, 40)
  breakdown['type_variety'] = varietyScore
  score += varietyScore

  // Bonus for external features - non-subtractions with offsets (15 pts each, max 60)
  const externalFeatures = geoms.filter(g =>
    !g.subtract && !g.intersect && (g.offsetX || g.offsetY || g.offsetZ)
  )
  const externalScore = Math.min(externalFeatures.length * 15, 60)
  breakdown['external_features'] = externalScore
  score += externalScore

  // Bonus for color variations (8 pts each, max 32)
  const colors = new Set(geoms.map(g => g.fill).filter(Boolean))
  const colorScore = Math.min(colors.size * 8, 32)
  breakdown['color_variety'] = colorScore
  score += colorScore

  // Penalty: only subtractions from single base (-30)
  const unionCount = geoms.filter(g => !g.subtract && !g.intersect).length
  if (unionCount <= 1 && geoms.length > 1) {
    breakdown['single_base_penalty'] = -30
    score -= 30
    warnings.push('Single base shape with only boolean operations')
  }

  // Penalty: no external features but has subtractions (-20)
  if (externalFeatures.length === 0 && geoms.some(g => g.subtract)) {
    breakdown['no_external_penalty'] = -20
    score -= 20
    warnings.push('No external features - internal subtractions are invisible')
  }

  return { score: Math.max(0, score), breakdown, warnings }
}

// Main
const file = process.argv[2]
if (!file) {
  console.error('Usage: npx tsx complexity-score.ts <path-to-part.json>')
  process.exit(1)
}

try {
  const { score, breakdown, warnings } = complexityScore(file)

  console.log(`\nComplexity Score for: ${file}`)
  console.log('─'.repeat(50))

  // Show breakdown
  Object.entries(breakdown).forEach(([key, value]) => {
    const sign = value >= 0 ? '+' : ''
    const label = key.replace(/_/g, ' ')
    console.log(`  ${label}: ${sign}${value}`)
  })

  console.log('─'.repeat(50))
  console.log(`  TOTAL: ${score}`)
  console.log('─'.repeat(50))

  // Rating
  if (score < 30) {
    console.log('Rating: ⚠ LOW - likely looks like a breeze block')
  } else if (score < 60) {
    console.log('Rating: → MODERATE - acceptable but could be improved')
  } else if (score < 100) {
    console.log('Rating: ✓ GOOD - visually interesting')
  } else {
    console.log('Rating: ★ EXCELLENT - highly detailed')
  }

  // Warnings
  if (warnings.length > 0) {
    console.log('\nWarnings:')
    warnings.forEach(w => console.log(`  ⚠ ${w}`))
  }

  // Exit with error if score too low
  if (score < 30) {
    process.exit(1)
  }

} catch (err) {
  console.error(`✗ Error: ${(err as Error).message}`)
  process.exit(1)
}
