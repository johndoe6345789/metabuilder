'use client'

interface ControlsProps {
  explosion: number
  rotation: number
  onExplosionChange: (val: number) => void
  onRotationChange: (val: number) => void
  onAnimate: () => void
  onExport: () => void
}

export default function Controls({
  explosion,
  rotation,
  onExplosionChange,
  onRotationChange,
  onAnimate,
  onExport
}: ControlsProps) {
  return (
    <div className="controls">
      <div className="control-group">
        <label>Explosion: {Math.round(explosion)}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={explosion}
          onChange={e => onExplosionChange(parseInt(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label>Rotation: {rotation}°</label>
        <input
          type="range"
          min="-25"
          max="25"
          value={rotation}
          onChange={e => onRotationChange(parseInt(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label>&nbsp;</label>
        <button onClick={onAnimate}>▶ Explode</button>
      </div>

      <div className="control-group">
        <label>&nbsp;</label>
        <button onClick={onExport}>⬇ Export SVG</button>
      </div>
    </div>
  )
}
