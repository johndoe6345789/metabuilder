# 3D Geometry Authoring Guide

## Overview

This guide documents the process for creating realistic 3D part geometry using the `geometry3d` JSON schema. The schema uses JSCAD-style CSG (Constructive Solid Geometry) operations to build complex shapes from primitives.

## The Feedback Loop Process

### 1. Start with Basic Shape
Begin with the dominant shape of the part:
```json
"geometry3d": [
  { "type": "box", "width": 100, "height": 85, "depth": 130, "fill": "#606070" }
]
```

### 2. View in Browser
- Navigate to the 3D Part View tab
- Select the part from the list
- Take a screenshot or visually inspect

### 3. Identify What's Wrong
Common issues:
- **"Breeze block" syndrome**: Part looks like a plain box with no character
- **Internal features invisible**: Boolean subtractions for cavities don't show from outside
- **Scale issues**: Part too small/large for camera position
- **Missing external details**: No flanges, bosses, ribs, or surface features

### 4. Add External Features
The key insight: **Internal subtractions are invisible from outside**. Add visible external features:
- Flanges and mounting surfaces
- Bolt bosses (raised cylinders around bolt holes)
- Structural ribs
- Bearing housings
- Access ports

### 5. Iterate
View → Analyze → Improve → Repeat until the part looks realistic.

---

## Geometry3D Schema Reference

### Primitive Types

| Type | Required Properties | Optional Properties |
|------|---------------------|---------------------|
| `box` | `width`, `height`, `depth` | all common |
| `cylinder` | `r`, `height` | all common |
| `sphere` | `r` | all common |
| `torus` | `r`, `tubeR` | all common |
| `cone` | `r1`, `r2`, `height` | all common |

### Common Properties

| Property | Type | Description |
|----------|------|-------------|
| `fill` | string | Hex color (e.g., `"#606070"`) |
| `material` | string | Reference to materials object |
| `offsetX/Y/Z` | number | Position offset in mm |
| `rotateX/Y/Z` | number | Rotation in degrees |
| `subtract` | boolean | Subtract from previous geometry |
| `intersect` | boolean | Intersect with previous geometry |

### Boolean Operations

Shapes are processed in order. By default, shapes are **unioned** (added together).

```json
"geometry3d": [
  { "type": "box", "width": 100, "height": 80, "depth": 120 },
  { "type": "cylinder", "r": 30, "height": 90, "subtract": true }
]
```

This creates a box with a cylindrical hole through it.

---

## Design Patterns by Part Type

### Housing/Case Parts

**Problem**: Internal cavities are invisible from outside.

**Solution**: Add external features that define the shape.

```json
"geometry3d": [
  // Main body
  { "type": "box", "width": 100, "height": 85, "depth": 130, "fill": "#606070" },
  // Hollow interior (invisible but functional)
  { "type": "box", "width": 80, "height": 65, "depth": 110, "offsetY": 5, "subtract": true },

  // VISIBLE EXTERNAL FEATURES:
  // Mating flange
  { "type": "box", "width": 120, "height": 95, "depth": 12, "offsetZ": -65, "fill": "#707080" },

  // Bolt bosses (raised cylinders)
  { "type": "cylinder", "r": 10, "height": 20, "offsetX": -50, "offsetY": -38, "offsetZ": -65 },
  { "type": "cylinder", "r": 10, "height": 20, "offsetX": 50, "offsetY": -38, "offsetZ": -65 },

  // Bolt holes through bosses
  { "type": "cylinder", "r": 4, "height": 25, "offsetX": -50, "offsetY": -38, "offsetZ": -65, "subtract": true },
  { "type": "cylinder", "r": 4, "height": 25, "offsetX": 50, "offsetY": -38, "offsetZ": -65, "subtract": true },

  // Structural ribs
  { "type": "box", "width": 8, "height": 70, "depth": 110, "offsetX": -42, "fill": "#555560" },
  { "type": "box", "width": 8, "height": 70, "depth": 110, "offsetX": 42, "fill": "#555560" },

  // Bearing housing (cylindrical boss)
  { "type": "cylinder", "r": 35, "height": 20, "rotateX": 90, "offsetZ": 55, "fill": "#707080" },
  { "type": "cylinder", "r": 25, "height": 25, "rotateX": 90, "offsetZ": 55, "subtract": true }
]
```

### Rotating Parts (Gears, Flywheels)

**Pattern**: Disc + features + center bore

```json
"geometry3d": [
  // Main disc
  { "type": "cylinder", "r": 55, "height": 25, "fill": "#404550" },
  // Ring gear (torus around edge)
  { "type": "torus", "r": 52, "tubeR": 4, "fill": "#505560" },
  // Center bore
  { "type": "cylinder", "r": 15, "height": 30, "subtract": true },
  // Lightening holes (optional)
  { "type": "cylinder", "r": 8, "height": 30, "offsetX": 30, "subtract": true },
  { "type": "cylinder", "r": 8, "height": 30, "offsetX": -30, "subtract": true }
]
```

### Shaft Parts

**Pattern**: Cylinder + features along length

```json
"geometry3d": [
  // Main shaft
  { "type": "cylinder", "r": 12, "height": 150, "rotateX": 90, "fill": "#707580" },
  // Splined section (larger diameter)
  { "type": "cylinder", "r": 15, "height": 30, "rotateX": 90, "offsetZ": -50, "fill": "#606570" },
  // Bearing journal (polished surface)
  { "type": "cylinder", "r": 14, "height": 20, "rotateX": 90, "offsetZ": 40, "fill": "#808590" },
  // Keyway (subtract a small box)
  { "type": "box", "width": 5, "height": 3, "depth": 25, "offsetY": 10, "offsetZ": 0, "subtract": true }
]
```

### Bearing Parts

**Pattern**: Outer race + inner race + visible gap

```json
"geometry3d": [
  // Outer race
  { "type": "cylinder", "r": 30, "height": 15, "fill": "#707580" },
  // Inner bore (creates the race)
  { "type": "cylinder", "r": 20, "height": 16, "subtract": true },
  // Inner race (smaller cylinder inside)
  { "type": "cylinder", "r": 18, "height": 12, "fill": "#808590" },
  // Shaft bore
  { "type": "cylinder", "r": 10, "height": 15, "subtract": true }
]
```

### Plate/Disc Parts (Clutch, Pressure Plate)

**Pattern**: Flat disc + surface features

```json
"geometry3d": [
  // Main disc
  { "type": "cylinder", "r": 50, "height": 8, "fill": "#505050" },
  // Friction surface (slightly different color)
  { "type": "cylinder", "r": 48, "height": 2, "offsetY": 3, "fill": "#606060" },
  // Center spline hub
  { "type": "cylinder", "r": 20, "height": 15, "fill": "#707070" },
  // Spline bore
  { "type": "cylinder", "r": 12, "height": 20, "subtract": true },
  // Rivets or spring windows
  { "type": "cylinder", "r": 3, "height": 10, "offsetX": 35, "subtract": true },
  { "type": "cylinder", "r": 3, "height": 10, "offsetX": -35, "subtract": true }
]
```

---

## Color Guidelines

Use subtle color variations to distinguish features:

| Feature Type | Suggested Colors |
|--------------|------------------|
| Main body | `#606070`, `#505060` |
| Flanges | `#707080` (slightly lighter) |
| Bolt bosses | `#808090` (lighter still) |
| Ribs | `#555560` (slightly darker) |
| Polished surfaces | `#909095` |
| Steel parts | `#707580` |
| Aluminum | `#808890` |
| Cast iron | `#505560` |

---

## Scale Considerations

All dimensions are in **millimeters**. The camera is positioned at `[150, 150, 150]` with a grid of 200 units.

| Part Size | Typical Dimensions |
|-----------|-------------------|
| Small (bearings, seals) | 20-50mm |
| Medium (gears, shafts) | 50-150mm |
| Large (housings) | 100-200mm |

---

## Debugging Tips

### Part Not Visible
- Check camera position vs part scale
- Ensure geometry3d array is not empty
- Check browser console for errors

### Part Looks Like a Box
- Add external features (flanges, bosses, ribs)
- Internal subtractions don't show - add surface detail

### Colors Look Wrong
- Check `fill` property format (must be hex string)
- Verify material references exist

### Boolean Operations Not Working
- Order matters: shapes are processed sequentially
- `subtract: true` subtracts from the union of all previous shapes
- Check that subtraction geometry is positioned correctly

---

## Workflow Summary

1. **Identify the part type** (housing, gear, shaft, bearing, plate)
2. **Start with main body** - dominant shape
3. **Add external features** - flanges, bosses, ribs (visible from outside)
4. **Add functional geometry** - bores, holes, keyways (boolean subtractions)
5. **Apply color variations** - distinguish different features
6. **View and iterate** - use the visual feedback loop

The key insight: **What you see is what matters**. Internal features are functionally correct but visually invisible. Always add external surface details to make parts look realistic.

---

## Headless Development (No Browser Required)

For faster iteration without opening a browser, use these CLI-based approaches.

### 1. JSON Schema Validation

Validate geometry3d structure before rendering:

```bash
# scripts/validate-geometry.ts
npx tsx scripts/validate-geometry.ts public/packages/automotive/ford/fiesta/gearbox/parts/gear-case.json
```

```typescript
// scripts/validate-geometry.ts
import { readFileSync } from 'fs'

const VALID_TYPES = ['box', 'cylinder', 'sphere', 'torus', 'cone', 'extrude', 'revolve']
const REQUIRED_PROPS: Record<string, string[]> = {
  box: ['width', 'height', 'depth'],
  cylinder: ['r', 'height'],
  sphere: ['r'],
  torus: ['r', 'tubeR'],
  cone: ['r1', 'r2', 'height'],
}

function validate(filePath: string) {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const errors: string[] = []

  if (!data.geometry3d || !Array.isArray(data.geometry3d)) {
    errors.push('Missing or invalid geometry3d array')
    return errors
  }

  data.geometry3d.forEach((geom: any, i: number) => {
    if (!VALID_TYPES.includes(geom.type)) {
      errors.push(`[${i}] Invalid type: ${geom.type}`)
    }
    const required = REQUIRED_PROPS[geom.type] || []
    required.forEach(prop => {
      if (geom[prop] === undefined) {
        errors.push(`[${i}] Missing required prop: ${prop}`)
      }
    })
  })

  return errors
}

const file = process.argv[2]
const errors = validate(file)
if (errors.length) {
  console.error('Validation errors:', errors)
  process.exit(1)
} else {
  console.log('✓ Valid geometry3d')
}
```

### 2. Geometry Statistics CLI

Get metrics about the geometry without rendering:

```typescript
// scripts/geometry-stats.ts
import { readFileSync } from 'fs'

function analyzeGeometry(filePath: string) {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const geoms = data.geometry3d || []

  const stats = {
    totalPrimitives: geoms.length,
    byType: {} as Record<string, number>,
    booleanOps: { subtract: 0, intersect: 0, union: 0 },
    boundingBox: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
    hasExternalFeatures: false,
  }

  geoms.forEach((g: any) => {
    stats.byType[g.type] = (stats.byType[g.type] || 0) + 1
    if (g.subtract) stats.booleanOps.subtract++
    else if (g.intersect) stats.booleanOps.intersect++
    else stats.booleanOps.union++

    // Check for external features (things that extend beyond main body)
    if (!g.subtract && !g.intersect && (g.offsetX || g.offsetY || g.offsetZ)) {
      stats.hasExternalFeatures = true
    }
  })

  return stats
}

const file = process.argv[2]
const stats = analyzeGeometry(file)
console.log(JSON.stringify(stats, null, 2))

// Warnings
if (!stats.hasExternalFeatures && stats.booleanOps.subtract > 0) {
  console.warn('⚠ Warning: Has subtractions but no external features - may look like a "breeze block"')
}
```

### 3. Export to STL for External Viewer

Generate STL files that can be viewed in any 3D viewer (VS Code extensions, online viewers, etc.):

```typescript
// scripts/export-stl.ts
import { readFileSync, writeFileSync } from 'fs'
import * as jscad from '@jscad/modeling'

// ... build geometry from JSON (same as jscad-to-three.ts)

function exportSTL(filePath: string, outputPath: string) {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const geometry = buildJscadGeometry(data.geometry3d)

  // Convert to STL using @jscad/stl-serializer
  const stlSerializer = require('@jscad/stl-serializer')
  const stlData = stlSerializer.serialize({ binary: false }, geometry)

  writeFileSync(outputPath, stlData.join(''))
  console.log(`✓ Exported to ${outputPath}`)
}
```

```bash
# Install STL serializer
npm install @jscad/stl-serializer

# Export part to STL
npx tsx scripts/export-stl.ts parts/gear-case.json gear-case.stl

# View in VS Code with "3D Viewer" extension, or upload to online STL viewer
```

### 4. ASCII Art Preview

Quick terminal-based preview showing bounding box and feature positions:

```typescript
// scripts/ascii-preview.ts
function asciiPreview(filePath: string) {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const geoms = data.geometry3d || []

  // Create 40x20 character grid (top-down view: X/Z plane)
  const grid: string[][] = Array(20).fill(null).map(() => Array(40).fill('.'))

  // Scale factor
  const scale = 0.2
  const centerX = 20, centerZ = 10

  geoms.forEach((g: any, i: number) => {
    if (g.subtract) return // Skip subtractions

    const x = Math.round((g.offsetX || 0) * scale + centerX)
    const z = Math.round((g.offsetZ || 0) * scale + centerZ)

    if (x >= 0 && x < 40 && z >= 0 && z < 20) {
      const char = g.type[0].toUpperCase() // B=box, C=cylinder, S=sphere, T=torus
      grid[z][x] = char
    }
  })

  console.log('Top-down view (X/Z plane):')
  console.log('┌' + '─'.repeat(40) + '┐')
  grid.forEach(row => console.log('│' + row.join('') + '│'))
  console.log('└' + '─'.repeat(40) + '┘')
  console.log('Legend: B=box C=cylinder S=sphere T=torus .=empty')
}
```

Output:
```
Top-down view (X/Z plane):
┌────────────────────────────────────────┐
│....................B...................│
│..........C.........B.........C.........│
│....................B...................│
│....BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB......│
│....B..............B..............B.....│
│....B..............B..............B.....│
│....BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB......│
│....................C...................│
└────────────────────────────────────────┘
Legend: B=box C=cylinder S=sphere T=torus .=empty
```

### 5. Batch Validation

Check all parts in an assembly at once:

```bash
# scripts/validate-assembly.sh
#!/bin/bash
ASSEMBLY_PATH=$1

echo "Validating parts in $ASSEMBLY_PATH..."
for file in "$ASSEMBLY_PATH"/parts/*.json; do
  echo -n "$(basename $file): "
  npx tsx scripts/validate-geometry.ts "$file" 2>&1
done
```

```bash
./scripts/validate-assembly.sh public/packages/automotive/ford/fiesta/gearbox
```

### 6. Complexity Score

Calculate a "visual interest" score to detect bland geometry:

```typescript
// scripts/complexity-score.ts
function complexityScore(filePath: string): number {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const geoms = data.geometry3d || []

  let score = 0

  // Base score for primitive count
  score += geoms.length * 5

  // Bonus for variety of types
  const types = new Set(geoms.map((g: any) => g.type))
  score += types.size * 10

  // Bonus for external features (non-subtractions with offsets)
  const externalFeatures = geoms.filter((g: any) =>
    !g.subtract && !g.intersect && (g.offsetX || g.offsetY || g.offsetZ)
  )
  score += externalFeatures.length * 15

  // Bonus for color variations
  const colors = new Set(geoms.map((g: any) => g.fill).filter(Boolean))
  score += colors.size * 8

  // Penalty if only subtractions (breeze block)
  const onlySubtractions = geoms.filter((g: any) => !g.subtract).length <= 1
  if (onlySubtractions) score -= 30

  return Math.max(0, score)
}

const file = process.argv[2]
const score = complexityScore(file)
console.log(`Complexity score: ${score}`)
if (score < 30) console.warn('⚠ Low score - likely looks like a breeze block')
else if (score < 60) console.log('→ Moderate complexity')
else console.log('✓ Good visual complexity')
```

### 7. Playwright Headless Rendering

For automated screenshot generation without opening a visible browser:

```typescript
// scripts/headless-render.ts
import { chromium } from 'playwright'

async function renderPart(partId: string, outputPath: string) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(`http://localhost:3000/automotive/ford/fiesta/gearbox`)
  await page.click('text=3D Part View')
  await page.click(`text=${partId}`)
  await page.waitForTimeout(1000) // Wait for render

  await page.screenshot({ path: outputPath })
  console.log(`✓ Rendered to ${outputPath}`)

  await browser.close()
}

renderPart(process.argv[2], process.argv[3] || 'render.png')
```

```bash
# Render gear-case to PNG without visible browser
npx tsx scripts/headless-render.ts "Gear Case" gear-case.png
```

---

## Recommended Headless Workflow

1. **Edit JSON** - Modify geometry3d in part file
2. **Validate** - `npx tsx scripts/validate-geometry.ts <file>`
3. **Check stats** - `npx tsx scripts/geometry-stats.ts <file>`
4. **Score complexity** - `npx tsx scripts/complexity-score.ts <file>`
5. **Quick preview** - `npx tsx scripts/ascii-preview.ts <file>`
6. **Final render** (optional) - `npx tsx scripts/headless-render.ts <partName> output.png`

This workflow provides feedback in ~100ms per iteration vs ~2-3s for browser refresh.
