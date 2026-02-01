'use client'

import { useState, useMemo } from 'react'
import * as THREE from 'three'
import ThreeCanvas from './ThreeCanvas'
import PartSelector from './PartSelector'
import { geometryToThree } from '@/lib/jscad-to-three'
import type { Part, Materials } from '@/lib/types'

interface PartViewer3DProps {
  parts: Part[]
  materials: Materials
}

interface PartMeshProps {
  part: Part
  materials: Materials
}

function PartMesh({ part, materials }: PartMeshProps) {
  const geometry = useMemo(() => {
    console.log('PartMesh rendering:', part.id, 'geometry3d:', part.geometry3d)
    if (part.geometry3d && part.geometry3d.length > 0) {
      // Convert geometry3d to Three.js BufferGeometry
      try {
        const geom = geometryToThree(part.geometry3d)
        console.log('Generated geometry:', geom, 'positions:', geom.attributes.position?.count)
        return geom
      } catch (err) {
        console.error('Failed to convert geometry3d:', err)
        return new THREE.BoxGeometry(2, 2, 2)
      }
    }
    // Fallback to a simple box if no geometry3d present
    console.log('No geometry3d, using fallback box')
    return new THREE.BoxGeometry(2, 2, 2)
  }, [part.geometry3d, part.id])

  const materialColor = useMemo(() => {
    // Try to get color from first geometry3d fill, or material reference, or part material
    if (part.geometry3d && part.geometry3d.length > 0) {
      const firstGeom = part.geometry3d[0]
      if (firstGeom.fill) {
        return firstGeom.fill
      }
      if (firstGeom.material && materials[firstGeom.material]) {
        // Use first gradient stop color
        const mat = materials[firstGeom.material]
        if (mat.gradient.stops.length > 0) {
          return mat.gradient.stops[0].color
        }
      }
    }
    // Fall back to part material reference
    if (part.material && materials[part.material]) {
      const mat = materials[part.material]
      if (mat.gradient.stops.length > 0) {
        return mat.gradient.stops[0].color
      }
    }
    // Default gray color
    return '#888888'
  }, [part, materials])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={materialColor} />
    </mesh>
  )
}

export default function PartViewer3D({ parts, materials }: PartViewer3DProps) {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(
    parts.length > 0 ? parts[0].id : null
  )

  const selectedPart = useMemo(() => {
    return parts.find(p => p.id === selectedPartId) ?? null
  }, [parts, selectedPartId])

  const handleSelectPart = (partId: string) => {
    setSelectedPartId(partId)
  }

  return (
    <div className="part-viewer-3d">
      <div className="three-canvas-container">
        <ThreeCanvas>
          {selectedPart && (
            <PartMesh part={selectedPart} materials={materials} />
          )}
        </ThreeCanvas>
      </div>
      <PartSelector
        parts={parts}
        selectedPartId={selectedPartId}
        onSelectPart={handleSelectPart}
      />
    </div>
  )
}
