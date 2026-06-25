'use client'

import type { Tool, Hardware, TorqueSpec } from '@/lib/types'

interface ToolsProps { tools: Tool[] }
export function ToolsSection({ tools }: ToolsProps) {
  if (tools.length === 0) return null
  return (
    <div className="install-section">
      <h4>Required Tools</h4>
      <ul className="tool-list">
        {tools.map((tool, i) => (
          <li key={i} className={tool.required ? 'required' : 'optional'}>
            <span className="tool-name">{tool.name}</span>
            <span className="tool-size">{tool.size}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface HardwareProps { hardware: Hardware[] }
export function HardwareSection({ hardware }: HardwareProps) {
  if (hardware.length === 0) return null
  return (
    <div className="install-section">
      <h4>Hardware</h4>
      <ul className="hardware-list">
        {hardware.map((hw, i) => (
          <li key={i}>
            <span className="hw-name">{hw.name}</span>
            <span className="hw-spec">{hw.spec}</span>
            <span className="hw-qty">×{hw.qty}</span>
            {!hw.reusable && (
              <span className="hw-replace" title="Replace on reassembly">
                ⚠
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface TorqueProps { torque: TorqueSpec[] }
export function TorqueSection({ torque }: TorqueProps) {
  if (torque.length === 0) return null
  return (
    <div className="install-section">
      <h4>Torque Specs</h4>
      <ul className="torque-list">
        {torque.map((t, i) => (
          <li key={i}>
            <div className="torque-header">
              <span className="torque-fastener">{t.fastener}</span>
              <span className="torque-value">
                {t.value} {t.unit}
              </span>
            </div>
            {t.sequence && (
              <div className="torque-sequence">{t.sequence}</div>
            )}
            {t.notes && (
              <div className="torque-notes">{t.notes}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface NotesProps { notes: string[] }
export function NotesSection({ notes }: NotesProps) {
  if (notes.length === 0) return null
  return (
    <div className="install-section">
      <h4>Notes</h4>
      <ul className="notes-list">
        {notes.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>
    </div>
  )
}
