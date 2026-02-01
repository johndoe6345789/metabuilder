#!/usr/bin/env npx tsx
import { readFileSync } from 'fs'

const VALID_TYPES = ['box', 'cylinder', 'sphere', 'torus', 'cone', 'extrude', 'revolve']
const REQUIRED_PROPS: Record<string, string[]> = {
  box: ['width', 'height', 'depth'],
  cylinder: ['r', 'height'],
  sphere: ['r'],
  torus: ['r', 'tubeR'],
  cone: ['r1', 'r2', 'height'],
}

interface Geometry3D {
  type: string
  subtract?: boolean
  intersect?: boolean
  width?: number
  height?: number
  depth?: number
  r?: number
  r1?: number
  r2?: number
  tubeR?: number
  offsetX?: number
  offsetY?: number
  offsetZ?: number
  [key: string]: unknown
}

interface ValidationResult {
  errors: string[]
  warnings: string[]
}

function validate(filePath: string): ValidationResult {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const errors: string[] = []
  const warnings: string[] = []

  if (!data.geometry3d) {
    errors.push('Missing geometry3d array')
    return { errors, warnings }
  }

  if (!Array.isArray(data.geometry3d)) {
    errors.push('geometry3d must be an array')
    return { errors, warnings }
  }

  if (data.geometry3d.length === 0) {
    errors.push('geometry3d array is empty')
    return { errors, warnings }
  }

  const geoms: Geometry3D[] = data.geometry3d

  // Per-shape validation
  geoms.forEach((geom: Geometry3D, i: number) => {
    if (!geom.type) {
      errors.push(`[${i}] Missing type property`)
      return
    }

    if (!VALID_TYPES.includes(geom.type)) {
      errors.push(`[${i}] Invalid type: ${geom.type}`)
    }

    const required = REQUIRED_PROPS[geom.type] || []
    required.forEach(prop => {
      if (geom[prop] === undefined) {
        errors.push(`[${i}] ${geom.type} missing required prop: ${prop}`)
      }
    })

    // Validate numeric properties
    const numericProps = ['r', 'r1', 'r2', 'width', 'height', 'depth', 'tubeR', 'offsetX', 'offsetY', 'offsetZ', 'rotateX', 'rotateY', 'rotateZ']
    numericProps.forEach(prop => {
      if (geom[prop] !== undefined && typeof geom[prop] !== 'number') {
        errors.push(`[${i}] ${prop} must be a number, got ${typeof geom[prop]}`)
      }
    })

    // Validate fill color format (accepts #RGB or #RRGGBB)
    if (geom.fill && typeof geom.fill === 'string' && !geom.fill.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)) {
      errors.push(`[${i}] Invalid fill color format: ${geom.fill} (expected #RGB or #RRGGBB)`)
    }

    // Detect zero or negative dimensions
    const dimProps = ['width', 'height', 'depth', 'r', 'r1', 'r2', 'tubeR']
    dimProps.forEach(prop => {
      const val = geom[prop] as number | undefined
      if (val !== undefined && val <= 0) {
        errors.push(`[${i}] ${prop} must be positive, got ${val}`)
      }
    })
  })

  // Structural/semantic validation (bogus shape detection)
  detectBogusPatterns(geoms, errors, warnings)

  return { errors, warnings }
}

function detectBogusPatterns(geoms: Geometry3D[], errors: string[], warnings: string[]): void {
  // Count shape types
  const unionShapes = geoms.filter(g => !g.subtract && !g.intersect)
  const subtractions = geoms.filter(g => g.subtract)
  const intersections = geoms.filter(g => g.intersect)

  // Pattern 1: First shape is a subtraction (nothing to subtract from)
  if (geoms.length > 0 && geoms[0].subtract) {
    errors.push('First shape cannot be a subtraction (nothing to subtract from)')
  }

  // Pattern 2: First shape is an intersection (nothing to intersect with)
  if (geoms.length > 0 && geoms[0].intersect) {
    errors.push('First shape cannot be an intersection (nothing to intersect with)')
  }

  // Pattern 3: Only subtractions after first shape (breeze block)
  if (unionShapes.length === 1 && subtractions.length > 0 && geoms.length > 2) {
    warnings.push('BREEZE BLOCK: Single base shape with only subtractions - internal cuts are invisible from outside')
  }

  // Pattern 4: Subtraction larger than base in ALL dimensions (will hollow out completely)
  // Exception: Long thin cylinders are shaft bores (height >> radius is OK)
  if (unionShapes.length >= 1 && subtractions.length > 0) {
    const baseShape = unionShapes[0]
    const baseDims = getShapeDimensions(baseShape)
    const baseMaxDim = Math.max(...baseDims)

    subtractions.forEach((sub) => {
      const subDims = getShapeDimensions(sub)

      // Skip shaft bore detection: thin cylinder (r small, height large)
      if (sub.type === 'cylinder' && sub.r && sub.height) {
        const aspectRatio = sub.height / (sub.r * 2)
        if (aspectRatio > 3) {
          // This is a shaft bore - long thin cylinder, skip warning
          return
        }
      }

      // Check if subtraction is larger than base in all dimensions
      const subLargerInAll = subDims.every((d, i) => d > baseDims[i] * 0.9)
      if (subLargerInAll && !sub.offsetX && !sub.offsetY && !sub.offsetZ) {
        warnings.push(`Subtraction [${geoms.indexOf(sub)}] encompasses base shape - may hollow out completely`)
      }
    })
  }

  // Pattern 5: No external features (all offsets are zero or on subtractions)
  const externalFeatures = geoms.filter(g =>
    !g.subtract && !g.intersect &&
    (g.offsetX || g.offsetY || g.offsetZ)
  )
  if (externalFeatures.length === 0 && subtractions.length > 0) {
    warnings.push('NO EXTERNAL FEATURES: All non-subtractions are centered - part will look like a basic shape with invisible internal cuts')
  }

  // Pattern 6: Duplicate shapes (exact same params)
  const shapeSignatures = new Map<string, number[]>()
  geoms.forEach((g, i) => {
    const sig = JSON.stringify(g)
    if (!shapeSignatures.has(sig)) {
      shapeSignatures.set(sig, [])
    }
    shapeSignatures.get(sig)!.push(i)
  })
  shapeSignatures.forEach((indices, sig) => {
    if (indices.length > 1) {
      warnings.push(`Duplicate shapes at indices [${indices.join(', ')}] - may be unintentional`)
    }
  })

  // Pattern 7: Subtraction completely outside base shape
  if (unionShapes.length >= 1) {
    const baseShape = unionShapes[0]
    const baseBounds = getShapeBounds(baseShape)

    subtractions.forEach((sub) => {
      const subOffset = Math.sqrt(
        Math.pow(sub.offsetX || 0, 2) +
        Math.pow(sub.offsetY || 0, 2) +
        Math.pow(sub.offsetZ || 0, 2)
      )
      const subBounds = getShapeBounds(sub)

      // If subtraction is offset beyond base bounds, it does nothing
      if (subOffset > baseBounds.maxDim + subBounds.maxDim / 2) {
        const idx = geoms.indexOf(sub)
        warnings.push(`Subtraction [${idx}] is outside base shape bounds - has no effect`)
      }
    })
  }

  // Pattern 8: Very thin shapes (likely invisible)
  geoms.forEach((g, i) => {
    if (g.subtract) return // Thin subtractions are fine

    const dims = getShapeDimensions(g)
    const minDim = Math.min(...dims.filter(d => d > 0))
    const maxDim = Math.max(...dims)

    if (minDim < 1 && maxDim > 20) {
      warnings.push(`Shape [${i}] has very thin dimension (${minDim}mm) - may be invisible`)
    }
  })

  // Pattern 9: Dominant torus (donut shape overwhelms part)
  // A torus with tubeR > 10% of main body radius makes the part look like a donut
  const torusShapes = geoms.filter(g => g.type === 'torus' && !g.subtract)
  if (torusShapes.length > 0 && unionShapes.length > 0) {
    const mainBody = unionShapes[0]
    const mainDims = getShapeDimensions(mainBody)
    const mainRadius = Math.max(...mainDims) / 2

    torusShapes.forEach((torus) => {
      const tubeR = torus.tubeR || 0
      const torusR = torus.r || 0

      // Warning if torus tube is thick relative to main body
      if (tubeR > mainRadius * 0.15) {
        const idx = geoms.indexOf(torus)
        warnings.push(`DONUT SHAPE: Torus [${idx}] has thick tube (${tubeR}mm) relative to body (${mainRadius}mm radius) - part will look like a donut`)
      }

      // Warning if torus radius is close to or larger than main body
      if (torusR > mainRadius * 0.9) {
        const idx = geoms.indexOf(torus)
        warnings.push(`DOMINANT TORUS: Torus [${idx}] radius (${torusR}mm) dominates body (${mainRadius}mm) - consider using cylinder rings instead`)
      }
    })
  }
}

function getShapeBounds(geom: Geometry3D): { maxDim: number } {
  const dims = getShapeDimensions(geom)
  return { maxDim: Math.max(...dims, 1) }
}

function getShapeDimensions(geom: Geometry3D): number[] {
  switch (geom.type) {
    case 'box':
      return [geom.width || 0, geom.height || 0, geom.depth || 0]
    case 'cylinder':
      return [(geom.r || 0) * 2, geom.height || 0, (geom.r || 0) * 2]
    case 'sphere':
      const d = (geom.r || 0) * 2
      return [d, d, d]
    case 'torus':
      const outer = ((geom.r || 0) + (geom.tubeR || 0)) * 2
      return [outer, (geom.tubeR || 0) * 2, outer]
    case 'cone':
      const maxR = Math.max(geom.r1 || 0, geom.r2 || 0) * 2
      return [maxR, geom.height || 0, maxR]
    default:
      return [0, 0, 0]
  }
}

// Main
const file = process.argv[2]
const strictMode = process.argv.includes('--strict')

if (!file) {
  console.error('Usage: npx tsx validate-geometry.ts <path-to-part.json> [--strict]')
  console.error('  --strict: Treat warnings as errors')
  process.exit(1)
}

try {
  const { errors, warnings } = validate(file)

  if (errors.length) {
    console.error(`✗ Validation FAILED for ${file}:`)
    errors.forEach(e => console.error(`  ✗ ${e}`))
  }

  if (warnings.length) {
    console.warn(`\n⚠ Warnings for ${file}:`)
    warnings.forEach(w => console.warn(`  ⚠ ${w}`))
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`✓ Valid geometry3d in ${file}`)
  } else if (errors.length === 0) {
    console.log(`\n→ Structurally valid but has ${warnings.length} warning(s)`)
  }

  // Exit code
  if (errors.length > 0) {
    process.exit(1)
  } else if (strictMode && warnings.length > 0) {
    process.exit(1)
  }
} catch (err) {
  console.error(`✗ Error reading file: ${(err as Error).message}`)
  process.exit(1)
}
