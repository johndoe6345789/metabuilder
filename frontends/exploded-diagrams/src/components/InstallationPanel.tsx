'use client'

import type { Part } from '@/lib/types'
import materialData from './data/materials.json'
import {
  ToolsSection,
  HardwareSection,
  TorqueSection,
  NotesSection,
} from './InstallationSections'

const MATERIAL_NAMES = materialData.names as Record<string, string>

interface InstallationPanelProps {
  part: Part
  onClose: () => void
}

export default function InstallationPanel({
  part,
  onClose,
}: InstallationPanelProps) {
  const inst = part.installation
  const matName = MATERIAL_NAMES[part.material] || part.material

  return (
    <div className="panel installation-panel">
      <div className="panel-header">
        <h3>{part.name}</h3>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="part-meta">
        <span className="pn">{part.partNumber}</span>
        <span className="material">{matName}</span>
      </div>

      {inst ? (
        <>
          <ToolsSection tools={inst.tools} />
          <HardwareSection hardware={inst.hardware} />
          <TorqueSection torque={inst.torque} />
          <NotesSection notes={inst.notes} />
        </>
      ) : (
        <p className="no-install-data">No installation data available</p>
      )}
    </div>
  )
}
