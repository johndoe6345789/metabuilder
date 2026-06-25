'use client'

import dynamic from 'next/dynamic'
import Controls from '@/components/Controls'
import Sidebar from '@/components/Sidebar'
import Tooltip from '@/components/Tooltip'
import type { Assembly, Materials, Part } from '@/lib/types'

const DiagramRenderer = dynamic(
  () => import('@/components/DiagramRenderer'),
  {
    loading: () => (
      <div
        style={{ height: '100%', background: '#1a1a2e', borderRadius: 8 }}
      />
    ),
  }
)

interface TooltipState { part: Part; x: number; y: number }

interface ExplodedViewProps {
  data: Assembly
  materials: Materials
  explosion: number
  rotation: number
  highlightedPart: string | null
  selectedPart: Part | null
  tooltip: TooltipState | null
  onExplosionChange: (val: number) => void
  onRotationChange: (val: number) => void
  onAnimate: () => void
  onExport: () => void
  onPartHover: (partId: string | null, event?: MouseEvent) => void
  onPartSelect: (partId: string | null) => void
}

export default function ExplodedView({
  data,
  materials,
  explosion,
  rotation,
  highlightedPart,
  selectedPart,
  tooltip,
  onExplosionChange,
  onRotationChange,
  onAnimate,
  onExport,
  onPartHover,
  onPartSelect,
}: ExplodedViewProps) {
  return (
    <>
      <Controls
        explosion={explosion}
        rotation={rotation}
        onExplosionChange={onExplosionChange}
        onRotationChange={onRotationChange}
        onAnimate={onAnimate}
        onExport={onExport}
      />
      <div className="main-layout">
        <div className="diagram-container">
          <DiagramRenderer
            assembly={data}
            materials={materials}
            explosion={explosion}
            rotation={rotation}
            highlightedPart={highlightedPart}
            onPartHover={onPartHover}
          />
        </div>
        <Sidebar
          assembly={data}
          materials={materials}
          highlightedPart={highlightedPart}
          selectedPart={selectedPart}
          onPartHover={onPartHover}
          onPartSelect={onPartSelect}
        />
      </div>
      <Tooltip tooltip={tooltip} materials={materials} />
    </>
  )
}
