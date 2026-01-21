import { FaviconDesignerCanvas } from './FaviconDesigner/FaviconDesignerCanvas'
import { FaviconDesignerSidebar } from './FaviconDesigner/FaviconDesignerSidebar'
import { FaviconDesignerToolbar } from './FaviconDesigner/FaviconDesignerToolbar'
import { useFaviconDesigner } from './FaviconDesigner/useFaviconDesigner'

export function FaviconDesigner() {
  const {
    activeDesign,
    activeDesignId,
    brushColor,
    brushEffect,
    brushSize,
    canvasRef,
    drawMode,
    drawingCanvasRef,
    glowIntensity,
    gradientColor,
    safeDesigns,
    selectedElement,
    selectedElementId,
    setActiveDesignId,
    setBrushColor,
    setBrushEffect,
    setBrushSize,
    setDrawMode,
    setGlowIntensity,
    setGradientColor,
    setSelectedElementId,
    handleAddElement,
    handleCanvasMouseDown,
    handleCanvasMouseLeave,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleDeleteDesign,
    handleDeleteElement,
    handleDuplicateDesign,
    handleExport,
    handleExportAll,
    handleNewDesign,
    handleUpdateDesign,
    handleUpdateElement,
  } = useFaviconDesigner()

  return (
    <div className="h-full flex flex-col bg-background">
      <FaviconDesignerToolbar
        drawMode={drawMode}
        canDelete={safeDesigns.length > 1}
        onNewDesign={handleNewDesign}
        onDuplicateDesign={handleDuplicateDesign}
        onDeleteDesign={handleDeleteDesign}
        onSelectMode={() => {
          setDrawMode('select')
          setSelectedElementId(null)
        }}
        onDrawMode={() => {
          setDrawMode('draw')
          setSelectedElementId(null)
        }}
        onEraseMode={() => {
          setDrawMode('erase')
          setSelectedElementId(null)
        }}
      />

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_400px]">
          <FaviconDesignerCanvas
            activeSize={activeDesign.size}
            brushEffect={brushEffect}
            brushSize={brushSize}
            canvasRef={canvasRef}
            drawingCanvasRef={drawingCanvasRef}
            drawMode={drawMode}
            onExport={handleExport}
            onExportAll={handleExportAll}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
          />
          <FaviconDesignerSidebar
            activeDesign={activeDesign}
            activeDesignId={activeDesignId}
            designs={safeDesigns}
            brushColor={brushColor}
            brushEffect={brushEffect}
            brushSize={brushSize}
            drawMode={drawMode}
            glowIntensity={glowIntensity}
            gradientColor={gradientColor}
            selectedElement={selectedElement}
            selectedElementId={selectedElementId}
            onAddElement={handleAddElement}
            onDeleteElement={handleDeleteElement}
            onSelectElement={setSelectedElementId}
            onSelectDesign={setActiveDesignId}
            onUpdateDesign={handleUpdateDesign}
            onUpdateElement={handleUpdateElement}
            onBrushEffectChange={setBrushEffect}
            onBrushColorChange={setBrushColor}
            onBrushSizeChange={setBrushSize}
            onGradientColorChange={setGradientColor}
            onGlowIntensityChange={setGlowIntensity}
          />
        </div>
      </div>
    </div>
  )
}
