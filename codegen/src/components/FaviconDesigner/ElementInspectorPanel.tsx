import { Label } from '@/components/ui/label'
import copy from '@/data/favicon-designer.json'
import { ColorInspector } from './ColorInspector'
import { FreehandInspector } from './FreehandInspector'
import { ShapeInspector } from './ShapeInspector'
import { TextEmojiInspector } from './TextEmojiInspector'
import { TransformInspector } from './TransformInspector'
import { FaviconDesign, FaviconElement } from './types'

type ElementInspectorPanelProps = {
  activeDesign: FaviconDesign
  selectedElement: FaviconElement
  onUpdateElement: (updates: Partial<FaviconElement>) => void
}

export const ElementInspectorPanel = ({
  activeDesign,
  selectedElement,
  onUpdateElement,
}: ElementInspectorPanelProps) => (
  <div className="space-y-4">
    <Label className="text-base font-semibold">{copy.inspector.title}</Label>

    {selectedElement.type === 'freehand' && (
      <FreehandInspector element={selectedElement} onUpdateElement={onUpdateElement} />
    )}

    {(selectedElement.type === 'text' || selectedElement.type === 'emoji') && (
      <TextEmojiInspector element={selectedElement} onUpdateElement={onUpdateElement} />
    )}

    {selectedElement.type !== 'text' && selectedElement.type !== 'emoji' && selectedElement.type !== 'freehand' && (
      <ShapeInspector element={selectedElement} activeDesign={activeDesign} onUpdateElement={onUpdateElement} />
    )}

    {selectedElement.type !== 'freehand' && (
      <TransformInspector element={selectedElement} activeDesign={activeDesign} onUpdateElement={onUpdateElement} />
    )}

    {selectedElement.type !== 'freehand' && <ColorInspector element={selectedElement} onUpdateElement={onUpdateElement} />}
  </div>
)
