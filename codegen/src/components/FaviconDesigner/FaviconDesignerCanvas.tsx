import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download } from '@phosphor-icons/react'
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
  <div className="border-r border-border p-6 flex flex-col items-center justify-center bg-muted/20">
    <Card className="p-8 mb-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border-2 border-border rounded-lg shadow-xl absolute top-0 left-0"
              style={{
                width: '400px',
                height: '400px',
                imageRendering: 'pixelated',
                pointerEvents: 'none',
              }}
            />
            <canvas
              ref={drawingCanvasRef}
              className="border-2 border-border rounded-lg shadow-xl relative z-10"
              style={{
                width: '400px',
                height: '400px',
                imageRendering: 'pixelated',
                cursor: drawMode === 'draw' ? 'crosshair' : drawMode === 'erase' ? 'not-allowed' : 'default',
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
            />
          </div>
          <Badge className="absolute -top-3 -right-3">
            {activeSize}x{activeSize}
          </Badge>
          {drawMode !== 'select' && (
            <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-accent">
              {drawMode === 'draw'
                ? formatCopy(copy.canvas.brushBadge, {
                    effect: copy.effects[brushEffect as keyof typeof copy.effects] || brushEffect,
                    size: brushSize,
                  })
                : formatCopy(copy.canvas.eraserBadge, { size: brushSize * 2 })}
            </Badge>
          )}
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {PRESET_SIZES.map((size) => (
            <div
              key={size}
              className="flex flex-col items-center gap-1 p-2 rounded border border-border hover:bg-accent/50 cursor-pointer"
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
                className="border border-border rounded"
                style={{ width: `${size / 2}px`, height: `${size / 2}px` }}
              />
              <span className="text-xs text-muted-foreground">
                {formatCopy(copy.canvas.presetLabel, { size })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>

    <div className="flex gap-2">
      <Button onClick={() => onExport('png')}>
        <Download size={16} className="mr-2" />
        {copy.export.png}
      </Button>
      <Button onClick={() => onExport('svg')} variant="outline">
        <Download size={16} className="mr-2" />
        {copy.export.svg}
      </Button>
      <Button onClick={onExportAll} variant="outline">
        <Download size={16} className="mr-2" />
        {copy.export.all}
      </Button>
    </div>
  </div>
)
