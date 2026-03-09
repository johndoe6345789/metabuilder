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
  width?: number
  height?: number
  depth?: number
  r?: number
  [key: string]: unknown
}

interface Stats {
  totalPrimitives: number
  byType: Record<string, number>
  booleanOps: { subtract: number; intersect: number; union: number }
  externalFeatureCount: number
  colorCount: number
  estimatedBounds: { width: number; height: number; depth: number }
}

function analyzeGeometry(filePath: string): Stats {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const geoms: Geometry3D[] = data.geometry3d || []

  const stats: Stats = {
    totalPrimitives: geoms.length,
    byType: {},
    booleanOps: { subtract: 0, intersect: 0, union: 0 },
    externalFeatureCount: 0,
    colorCount: 0,
    estimatedBounds: { width: 0, height: 0, depth: 0 },
  }

  const colors = new Set<string>()
  let maxX = 0, maxY = 0, maxZ = 0

  geoms.forEach((g) => {
    // Count by type
    stats.byType[g.type] = (stats.byType[g.type] || 0) + 1

    // Count boolean ops
    if (g.subtract) stats.booleanOps.subtract++
    else if (g.intersect) stats.booleanOps.intersect++
    else stats.booleanOps.union++

    // Count external features (union ops with offsets)
    if (!g.subtract && !g.intersect && (g.offsetX || g.offsetY || g.offsetZ)) {
      stats.externalFeatureCount++
    }

    // Track colors
    if (g.fill) colors.add(g.fill)

    // Estimate bounds
    const w = g.width || (g.r ? g.r * 2 : 0)
    const h = g.height || (g.r ? g.r * 2 : 0)
    const d = g.depth || (g.r ? g.r * 2 : 0)
    const ox = Math.abs(g.offsetX || 0)
    const oy = Math.abs(g.offsetY || 0)
    const oz = Math.abs(g.offsetZ || 0)

    maxX = Math.max(maxX, w + ox * 2)
    maxY = Math.max(maxY, h + oy * 2)
    maxZ = Math.max(maxZ, d + oz * 2)
  })

  stats.colorCount = colors.size
  stats.estimatedBounds = { width: maxX, height: maxY, depth: maxZ }

  return stats
}

// Main
const file = process.argv[2]
if (!file) {
  console.error('Usage: npx tsx geometry-stats.ts <path-to-part.json>')
  process.exit(1)
}

try {
  const stats = analyzeGeometry(file)

  console.log(`\nGeometry Statistics for: ${file}`)
  console.log('─'.repeat(50))
  console.log(`Total primitives: ${stats.totalPrimitives}`)
  console.log(`Types: ${Object.entries(stats.byType).map(([k, v]) => `${k}(${v})`).join(', ')}`)
  console.log(`Boolean ops: union=${stats.booleanOps.union}, subtract=${stats.booleanOps.subtract}, intersect=${stats.booleanOps.intersect}`)
  console.log(`External features: ${stats.externalFeatureCount}`)
  console.log(`Color variations: ${stats.colorCount}`)
  console.log(`Estimated bounds: ${stats.estimatedBounds.width}x${stats.estimatedBounds.height}x${stats.estimatedBounds.depth}mm`)
  console.log('─'.repeat(50))

  // Warnings
  if (stats.externalFeatureCount === 0 && stats.booleanOps.subtract > 0) {
    console.warn('⚠ WARNING: Has subtractions but no external features')
    console.warn('  → Part may look like a "breeze block"')
    console.warn('  → Consider adding flanges, bosses, or ribs')
  }

  if (stats.colorCount <= 1 && stats.totalPrimitives > 3) {
    console.warn('⚠ WARNING: Only 1 color for multiple primitives')
    console.warn('  → Consider adding color variation to distinguish features')
  }

  if (stats.booleanOps.union === 1 && stats.booleanOps.subtract > 0) {
    console.warn('⚠ WARNING: Single base shape with only subtractions')
    console.warn('  → External details will be invisible')
  }

} catch (err) {
  console.error(`✗ Error: ${(err as Error).message}`)
  process.exit(1)
}
