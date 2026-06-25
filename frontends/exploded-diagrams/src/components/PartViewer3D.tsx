'use client'

import ThreeCanvas from './ThreeCanvas'
import PartSelector from './PartSelector'
import PartMesh from './PartMesh'
import { useSelectedPart } from './hooks/useSelectedPart'
import type { Part, Materials } from '@/lib/types'

interface PartViewer3DProps {
  parts: Part[]
  materials: Materials
}

export default function PartViewer3D({
  parts,
  materials,
}: PartViewer3DProps) {
  const { selectedPartId, selectedPart, handleSelectPart } =
    useSelectedPart(parts)

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
