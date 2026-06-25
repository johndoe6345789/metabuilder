/**
 * JSCAD primitive creation, transform helpers, and boolean assembly
 */

import { primitives, booleans, transforms, geometries } from '@jscad/modeling'
import type { Geom3 } from '@jscad/modeling/src/geometries/types'
import type { Geometry3D } from './types'

const { cylinder, cuboid, sphere, torus, cylinderElliptic } = primitives
const { subtract, union, intersect } = booleans
const { translate, rotateX, rotateY, rotateZ } = transforms
export const { geom3 } = geometries

/** Creates a JSCAD primitive from a Geometry3D definition */
export function createPrimitive(geom: Geometry3D): Geom3 {
  switch (geom.type) {
    case 'cylinder':
      return cylinder({
        radius: geom.r ?? 1,
        height: geom.height ?? 1,
        segments: geom.segments ?? 32,
      })
    case 'box':
      // JSCAD cuboid uses [width, depth, height] order
      return cuboid({
        size: [geom.width ?? 1, geom.depth ?? 1, geom.height ?? 1],
      })
    case 'sphere':
      return sphere({ radius: geom.r ?? 1, segments: geom.segments ?? 32 })
    case 'torus': {
      const outerRadius = geom.r ?? 1
      const innerRadius = outerRadius - (geom.tubeR ?? 0.25)
      return torus({ innerRadius, outerRadius })
    }
    case 'cone':
      return cylinderElliptic({
        startRadius: [geom.r1 ?? 1, geom.r1 ?? 1],
        endRadius: [geom.r2 ?? 0, geom.r2 ?? 0],
        height: geom.height ?? 1,
        segments: geom.segments ?? 32,
      })
    default:
      console.warn(`Unsupported geometry type: ${geom.type}`)
      return cuboid({ size: [1, 1, 1] })
  }
}

/** Applies rotation/translation transforms to a JSCAD geometry */
export function applyTransforms(geom: Geom3, def: Geometry3D): Geom3 {
  let result = geom
  if (def.rotateX) result = rotateX((def.rotateX * Math.PI) / 180, result)
  if (def.rotateY) result = rotateY((def.rotateY * Math.PI) / 180, result)
  if (def.rotateZ) result = rotateZ((def.rotateZ * Math.PI) / 180, result)
  const ox = def.offsetX ?? 0
  const oy = def.offsetY ?? 0
  const oz = def.offsetZ ?? 0
  if (ox !== 0 || oy !== 0 || oz !== 0) {
    result = translate([ox, oy, oz], result)
  }
  return result
}

/**
 * Builds a JSCAD Geom3 from Geometry3D definitions.
 * Handles boolean operations (subtract, intersect) and transforms.
 */
export function buildJscadGeometry(geometry3d: Geometry3D[]): Geom3 {
  if (geometry3d.length === 0) {
    return cuboid({ size: [0.001, 0.001, 0.001] })
  }
  let accumulated: Geom3 | null = null
  for (const def of geometry3d) {
    const primitive = applyTransforms(createPrimitive(def), def)
    if (accumulated === null) {
      accumulated = primitive
    } else if (def.subtract) {
      accumulated = subtract(accumulated, primitive)
    } else if (def.intersect) {
      accumulated = intersect(accumulated, primitive)
    } else {
      accumulated = union(accumulated, primitive)
    }
  }
  return accumulated!
}
