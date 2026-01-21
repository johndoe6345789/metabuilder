#!/usr/bin/env npx tsx
import { readFileSync } from 'fs'

interface Geometry3D {
  type: string
  subtract?: boolean
  intersect?: boolean
  offsetX?: number
  offsetY?: number
  offsetZ?: number
  width?: number
  height?: number
  depth?: number
  r?: number
  [key: string]: unknown
}

function asciiPreview(filePath: string) {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const geoms: Geometry3D[] = data.geometry3d || []

  // Create grids for top-down (X/Z) and front (X/Y) views
  const gridWidth = 50
  const gridHeight = 25
  const topDown: string[][] = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(' '))
  const front: string[][] = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(' '))

  // Find bounds for scaling
  let maxDim = 0
  geoms.forEach(g => {
    const w = g.width || (g.r ? g.r * 2 : 50)
    const h = g.height || (g.r ? g.r * 2 : 50)
    const d = g.depth || (g.r ? g.r * 2 : 50)
    maxDim = Math.max(maxDim, w, h, d,
      Math.abs(g.offsetX || 0) * 2 + w,
      Math.abs(g.offsetY || 0) * 2 + h,
      Math.abs(g.offsetZ || 0) * 2 + d
    )
  })

  const scale = (gridWidth - 4) / maxDim
  const centerX = Math.floor(gridWidth / 2)
  const centerY = Math.floor(gridHeight / 2)

  // Type to character map
  const typeChar: Record<string, string> = {
    box: '█',
    cylinder: '○',
    sphere: '●',
    torus: '◎',
    cone: '▲',
  }

  // Draw geometries
  geoms.forEach((g, i) => {
    if (g.subtract) return // Skip subtractions in preview

    const char = typeChar[g.type] || '?'
    const ox = Math.round((g.offsetX || 0) * scale)
    const oy = Math.round((g.offsetY || 0) * scale)
    const oz = Math.round((g.offsetZ || 0) * scale)

    // Top-down view (X/Z plane, Y is up)
    const tx = centerX + ox
    const tz = centerY - oz  // Invert Z for display
    if (tx >= 0 && tx < gridWidth && tz >= 0 && tz < gridHeight) {
      topDown[tz][tx] = char
    }

    // Front view (X/Y plane, Z is depth)
    const fx = centerX + ox
    const fy = centerY - oy  // Invert Y for display
    if (fx >= 0 && fx < gridWidth && fy >= 0 && fy < gridHeight) {
      front[fy][fx] = char
    }
  })

  // Draw center crosshairs
  for (let i = 0; i < gridWidth; i++) {
    if (topDown[centerY][i] === ' ') topDown[centerY][i] = '·'
    if (front[centerY][i] === ' ') front[centerY][i] = '·'
  }
  for (let i = 0; i < gridHeight; i++) {
    if (topDown[i][centerX] === ' ') topDown[i][centerX] = '·'
    if (front[i][centerX] === ' ') front[i][centerX] = '·'
  }
  topDown[centerY][centerX] = '+'
  front[centerY][centerX] = '+'

  // Print
  console.log(`\nASCII Preview: ${filePath}`)
  console.log(`Scale: 1 char ≈ ${(1/scale).toFixed(1)}mm\n`)

  console.log('TOP-DOWN VIEW (X/Z plane, looking down Y axis):')
  console.log('┌' + '─'.repeat(gridWidth) + '┐')
  topDown.forEach(row => console.log('│' + row.join('') + '│'))
  console.log('└' + '─'.repeat(gridWidth) + '┘')
  console.log('  ← -X        +X →')

  console.log('\nFRONT VIEW (X/Y plane, looking down Z axis):')
  console.log('┌' + '─'.repeat(gridWidth) + '┐')
  front.forEach(row => console.log('│' + row.join('') + '│'))
  console.log('└' + '─'.repeat(gridWidth) + '┘')
  console.log('  ← -X        +X →')

  console.log('\nLegend: █=box ○=cylinder ●=sphere ◎=torus ▲=cone +=origin ·=axis')
  console.log(`Showing ${geoms.filter(g => !g.subtract).length} union shapes (subtractions hidden)`)
}

// Main
const file = process.argv[2]
if (!file) {
  console.error('Usage: npx tsx ascii-preview.ts <path-to-part.json>')
  process.exit(1)
}

try {
  asciiPreview(file)
} catch (err) {
  console.error(`✗ Error: ${(err as Error).message}`)
  process.exit(1)
}
