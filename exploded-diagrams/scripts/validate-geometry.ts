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
  [key: string]: unknown
}

function validate(filePath: string): string[] {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  const errors: string[] = []

  if (!data.geometry3d) {
    errors.push('Missing geometry3d array')
    return errors
  }

  if (!Array.isArray(data.geometry3d)) {
    errors.push('geometry3d must be an array')
    return errors
  }

  if (data.geometry3d.length === 0) {
    errors.push('geometry3d array is empty')
    return errors
  }

  data.geometry3d.forEach((geom: Geometry3D, i: number) => {
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
  })

  return errors
}

// Main
const file = process.argv[2]
if (!file) {
  console.error('Usage: npx tsx validate-geometry.ts <path-to-part.json>')
  process.exit(1)
}

try {
  const errors = validate(file)
  if (errors.length) {
    console.error(`✗ Validation failed for ${file}:`)
    errors.forEach(e => console.error(`  - ${e}`))
    process.exit(1)
  } else {
    console.log(`✓ Valid geometry3d in ${file}`)
  }
} catch (err) {
  console.error(`✗ Error reading file: ${(err as Error).message}`)
  process.exit(1)
}
