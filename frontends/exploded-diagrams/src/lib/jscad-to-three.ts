import * as THREE from 'three'
import { primitives, booleans, transforms, geometries } from '@jscad/modeling'
import type { Geom3 } from '@jscad/modeling/src/geometries/types'
import type { Geometry3D } from './types'

const { cylinder, cuboid, sphere, torus, cylinderElliptic } = primitives
const { subtract, union, intersect } = booleans
const { translate, rotateX, rotateY, rotateZ } = transforms
const { geom3 } = geometries

/**
 * Creates a JSCAD primitive from a Geometry3D definition
 */
function createPrimitive(geom: Geometry3D): Geom3 {
  switch (geom.type) {
    case 'cylinder': {
      const radius = geom.r ?? 1
      const height = geom.height ?? 1
      const segments = geom.segments ?? 32
      return cylinder({ radius, height, segments })
    }

    case 'box': {
      const width = geom.width ?? 1
      const height = geom.height ?? 1
      const depth = geom.depth ?? 1
      // JSCAD cuboid uses [width, depth, height] order
      return cuboid({ size: [width, depth, height] })
    }

    case 'sphere': {
      const radius = geom.r ?? 1
      const segments = geom.segments ?? 32
      return sphere({ radius, segments })
    }

    case 'torus': {
      const outerRadius = geom.r ?? 1
      const tubeRadius = geom.tubeR ?? 0.25
      const innerRadius = outerRadius - tubeRadius
      return torus({ innerRadius, outerRadius })
    }

    case 'cone': {
      const r1 = geom.r1 ?? 1  // bottom radius
      const r2 = geom.r2 ?? 0  // top radius
      const height = geom.height ?? 1
      const segments = geom.segments ?? 32
      return cylinderElliptic({
        startRadius: [r1, r1],
        endRadius: [r2, r2],
        height,
        segments
      })
    }

    default:
      // Return a small default cube for unsupported types
      console.warn(`Unsupported geometry type: ${geom.type}`)
      return cuboid({ size: [1, 1, 1] })
  }
}

/**
 * Applies transforms to a JSCAD geometry based on Geometry3D properties
 */
function applyTransforms(geom: Geom3, def: Geometry3D): Geom3 {
  let result = geom

  // Apply rotations (convert degrees to radians)
  if (def.rotateX !== undefined && def.rotateX !== 0) {
    result = rotateX((def.rotateX * Math.PI) / 180, result)
  }
  if (def.rotateY !== undefined && def.rotateY !== 0) {
    result = rotateY((def.rotateY * Math.PI) / 180, result)
  }
  if (def.rotateZ !== undefined && def.rotateZ !== 0) {
    result = rotateZ((def.rotateZ * Math.PI) / 180, result)
  }

  // Apply translation
  const offsetX = def.offsetX ?? 0
  const offsetY = def.offsetY ?? 0
  const offsetZ = def.offsetZ ?? 0
  if (offsetX !== 0 || offsetY !== 0 || offsetZ !== 0) {
    result = translate([offsetX, offsetY, offsetZ], result)
  }

  return result
}

/**
 * Builds a JSCAD Geom3 from an array of Geometry3D definitions.
 * Handles boolean operations (subtract, intersect) and transforms.
 */
export function buildJscadGeometry(geometry3d: Geometry3D[]): Geom3 {
  if (geometry3d.length === 0) {
    return cuboid({ size: [0.001, 0.001, 0.001] })
  }

  let accumulated: Geom3 | null = null

  for (const def of geometry3d) {
    // Create the primitive
    let primitive = createPrimitive(def)

    // Apply transforms
    primitive = applyTransforms(primitive, def)

    // Handle boolean operations
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

/**
 * Converts a JSCAD Geom3 to a Three.js BufferGeometry.
 * Extracts polygons and converts them to vertices/normals.
 */
export function jscadToThree(geom: Geom3): THREE.BufferGeometry {
  const polygons = geom3.toPolygons(geom)

  const positions: number[] = []
  const normals: number[] = []

  for (const polygon of polygons) {
    const vertices = polygon.vertices

    if (vertices.length < 3) continue

    // Calculate face normal using first three vertices
    const v0 = new THREE.Vector3(vertices[0][0], vertices[0][1], vertices[0][2])
    const v1 = new THREE.Vector3(vertices[1][0], vertices[1][1], vertices[1][2])
    const v2 = new THREE.Vector3(vertices[2][0], vertices[2][1], vertices[2][2])

    const edge1 = new THREE.Vector3().subVectors(v1, v0)
    const edge2 = new THREE.Vector3().subVectors(v2, v0)
    const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize()

    // Triangulate the polygon (fan triangulation)
    for (let i = 1; i < vertices.length - 1; i++) {
      // Triangle: vertex[0], vertex[i], vertex[i+1]
      const tri = [vertices[0], vertices[i], vertices[i + 1]]

      for (const vert of tri) {
        positions.push(vert[0], vert[1], vert[2])
        normals.push(normal.x, normal.y, normal.z)
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))

  return geometry
}

/**
 * Main export: Converts an array of Geometry3D definitions to Three.js BufferGeometry.
 * Builds JSCAD geometry with boolean operations, then converts to Three.js format.
 */
export function geometryToThree(geometry3d: Geometry3D[]): THREE.BufferGeometry {
  const jscadGeom = buildJscadGeometry(geometry3d)
  return jscadToThree(jscadGeom)
}
