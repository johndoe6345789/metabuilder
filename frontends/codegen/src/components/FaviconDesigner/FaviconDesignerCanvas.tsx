import { Badge } from '@metabuilder/fakemui/data-display'
import { Button } from '@metabuilder/fakemui/inputs'
import { Card } from '@metabuilder/fakemui/surfaces'
import { Download } from '@metabuilder/fakemui/icons'
import copy from '@/data/favicon-designer.json'
import { PRESET_SIZES } from './constants'
import { formatCopy } from './formatCopy'

type FaviconDesignerCanvasProps = {
  activeSize: number
  brushEffect: string
  brushSize: number
  canvasRef: React.RefObject<HTMLCanvasElement>
  drawingCanvasRef: React.RefObject<HTMLCanvasElement>
  drawMode: 'select' | 'draw' | 'erase'
  onExport: (format: 'png' | 'ico' | 'svg', size?: number) => void
  onExportAll: () => void
  onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void
  onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void
  onMouseUp: () => void
  onMouseLeave: () => void
}

export const FaviconDesignerCanvas = ({
  activeSize,
  brushEffect,
  brushSize,
  canvasRef,
  drawingCanvasRef,
  drawMode,
  onExport,
  onExportAll,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}: FaviconDesignerCanvasProps) => (
  <div>
    <Card>
      <div>
        <div>
          <div>
            <div>
              <canvas
                ref={canvasRef}
                style={{
                  width: '400px',
                  height: '400px',
                  imageRendering: 'pixelated',
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
              <canvas
                ref={drawingCanvasRef}
                style={{
                  width: '400px',
                  height: '400px',
                  imageRendering: 'pixelated',
                  position: 'relative',
                  cursor: drawMode === 'draw' ? 'crosshair' : drawMode === 'erase' ? 'not-allowed' : 'default',
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
              />
            </div>
            <Badge>
              {activeSize}x{activeSize}
            </Badge>
            {drawMode !== 'select' && (
              <Badge>
                {drawMode === 'draw'
                  ? formatCopy(copy.canvas.brushBadge, {
                      effect: copy.effects[brushEffect as keyof typeof copy.effects] || brushEffect,
                      size: brushSize,
                    })
                  : formatCopy(copy.canvas.eraserBadge, { size: brushSize * 2 })}
              </Badge>
            )}
          </div>

          <div>
            {PRESET_SIZES.map((size) => (
              <div
                key={size}
                onClick={() => onExport('png', size)}
                title={formatCopy(copy.canvas.exportPresetTitle, { size })}
              >
                <canvas
                  width={size}
                  height={size}
                  ref={(canvas) => {
                    if (!canvas) return
                    const ctx = canvas.getContext('2d')
                    if (!ctx || !canvasRef.current) return
                    ctx.drawImage(canvasRef.current, 0, 0, size, size)
                  }}
                  style={{ width: `${size / 2}px`, height: `${size / 2}px` }}
                />
                <span>
                  {formatCopy(copy.canvas.presetLabel, { size })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>

    <div>
      <Button onClick={() => onExport('png')} variant="filled">
        <Download size={16} />
        {copy.export.png}
      </Button>
      <Button onClick={() => onExport('svg')} variant="outlined">
        <Download size={16} />
        {copy.export.svg}
      </Button>
      <Button onClick={onExportAll} variant="outlined">
        <Download size={16} />
        {copy.export.all}
      </Button>
    </div>
  </div>
)
