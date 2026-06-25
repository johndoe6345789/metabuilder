/**
 * Converts JSCAD geometry to Three.js BufferGeometry.
 *
 * Primitive creation and boolean ops live in jscad-primitives.ts.
 */

import * as THREE from 'three'
import type { Geom3 } from '@jscad/modeling/src/geometries/types'
import type { Geometry3D } from './types'
import { buildJscadGeometry, geom3 } from './jscad-primitives'

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

    const v0 = new THREE.Vector3(
      vertices[0][0], vertices[0][1], vertices[0][2]
    )
    const v1 = new THREE.Vector3(
      vertices[1][0], vertices[1][1], vertices[1][2]
    )
    const v2 = new THREE.Vector3(
      vertices[2][0], vertices[2][1], vertices[2][2]
    )

    const edge1 = new THREE.Vector3().subVectors(v1, v0)
    const edge2 = new THREE.Vector3().subVectors(v2, v0)
    const normal = new THREE.Vector3()
      .crossVectors(edge1, edge2)
      .normalize()

    // Triangulate the polygon (fan triangulation)
    for (let i = 1; i < vertices.length - 1; i++) {
      const tri = [vertices[0], vertices[i], vertices[i + 1]]
      for (const vert of tri) {
        positions.push(vert[0], vert[1], vert[2])
        normals.push(normal.x, normal.y, normal.z)
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  )
  geometry.setAttribute(
    'normal',
    new THREE.Float32BufferAttribute(normals, 3)
  )

  return geometry
}

/**
 * Main export: Converts Geometry3D definitions to Three.js BufferGeometry.
 * Builds JSCAD geometry with boolean operations, then converts.
 */
export function geometryToThree(
  geometry3d: Geometry3D[]
): THREE.BufferGeometry {
  const jscadGeom = buildJscadGeometry(geometry3d)
  return jscadToThree(jscadGeom)
}
