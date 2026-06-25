'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { geometryToThree } from '@/lib/jscad-to-three'
import type { Part, Materials } from '@/lib/types'

interface PartMeshProps {
  part: Part
  materials: Materials
}

export default function PartMesh({ part, materials }: PartMeshProps) {
  const geometry = useMemo(() => {
    if (part.geometry3d && part.geometry3d.length > 0) {
      try {
        return geometryToThree(part.geometry3d)
      } catch (err) {
        console.error('Failed to convert geometry3d:', err)
        return new THREE.BoxGeometry(2, 2, 2)
      }
    }
    return new THREE.BoxGeometry(2, 2, 2)
  }, [part.geometry3d])

  const materialColor = useMemo(() => {
    if (part.geometry3d && part.geometry3d.length > 0) {
      const first = part.geometry3d[0]
      if (first.fill) return first.fill
      if (first.material && materials[first.material]) {
        const mat = materials[first.material]
        if (mat.gradient.stops.length > 0) {
          return mat.gradient.stops[0].color
        }
      }
    }
    if (part.material && materials[part.material]) {
      const mat = materials[part.material]
      if (mat.gradient.stops.length > 0) {
        return mat.gradient.stops[0].color
      }
    }
    return '#888888'
  }, [part, materials])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={materialColor} />
    </mesh>
  )
}
