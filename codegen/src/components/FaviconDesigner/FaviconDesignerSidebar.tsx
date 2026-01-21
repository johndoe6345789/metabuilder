import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { BrushSettingsPanel } from './BrushSettingsPanel'
import { DesignSettingsPanel } from './DesignSettingsPanel'
import { ElementInspectorPanel } from './ElementInspectorPanel'
import { ElementsPanel } from './ElementsPanel'
import { BrushEffect, FaviconDesign, FaviconElement } from './types'

type FaviconDesignerSidebarProps = {
  activeDesign: FaviconDesign
  activeDesignId: string
  brushColor: string
  brushEffect: BrushEffect
  brushSize: number
  drawMode: 'select' | 'draw' | 'erase'
  glowIntensity: number
  gradientColor: string
  selectedElement: FaviconElement | undefined
  selectedElementId: string | null
  designs: FaviconDesign[]
  onAddElement: (type: FaviconElement['type']) => void
  onDeleteElement: (id: string) => void
  onSelectElement: (id: string) => void
  onSelectDesign: (value: string) => void
  onUpdateDesign: (updates: Partial<FaviconDesign>) => void
  onUpdateElement: (updates: Partial<FaviconElement>) => void
  onBrushEffectChange: (value: BrushEffect) => void
  onBrushColorChange: (value: string) => void
  onBrushSizeChange: (value: number) => void
  onGradientColorChange: (value: string) => void
  onGlowIntensityChange: (value: number) => void
}

export const FaviconDesignerSidebar = ({
  activeDesign,
  activeDesignId,
  brushColor,
  brushEffect,
  brushSize,
  drawMode,
  glowIntensity,
  gradientColor,
  selectedElement,
  selectedElementId,
  designs,
  onAddElement,
  onDeleteElement,
  onSelectElement,
  onSelectDesign,
  onUpdateDesign,
  onUpdateElement,
  onBrushEffectChange,
  onBrushColorChange,
  onBrushSizeChange,
  onGradientColorChange,
  onGlowIntensityChange,
}: FaviconDesignerSidebarProps) => (
  <ScrollArea className="h-full">
    <div className="p-6 space-y-6">
      <DesignSettingsPanel
        activeDesign={activeDesign}
        activeDesignId={activeDesignId}
        designs={designs}
        onUpdateDesign={onUpdateDesign}
        onSelectDesign={onSelectDesign}
      />

      <Separator />

      <ElementsPanel
        activeDesign={activeDesign}
        drawMode={drawMode}
        selectedElementId={selectedElementId}
        onAddElement={onAddElement}
        onSelectElement={onSelectElement}
        onDeleteElement={onDeleteElement}
      />

      {drawMode !== 'select' && (
        <>
          <Separator />
          <BrushSettingsPanel
            drawMode={drawMode}
            brushEffect={brushEffect}
            brushColor={brushColor}
            brushSize={brushSize}
            gradientColor={gradientColor}
            glowIntensity={glowIntensity}
            onBrushEffectChange={onBrushEffectChange}
            onBrushColorChange={onBrushColorChange}
            onBrushSizeChange={onBrushSizeChange}
            onGradientColorChange={onGradientColorChange}
            onGlowIntensityChange={onGlowIntensityChange}
          />
        </>
      )}

      {selectedElement && drawMode === 'select' && (
        <>
          <Separator />
          <ElementInspectorPanel
            activeDesign={activeDesign}
            selectedElement={selectedElement}
            onUpdateElement={onUpdateElement}
          />
        </>
      )}
    </div>
  </ScrollArea>
)
