import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import type { Workflow, WorkflowNode } from '@/workflow-editor'
import { useWorkflowEditor } from './use-workflow-editor'

const node = (id: string, x = 0, y = 0): WorkflowNode => ({
  id,
  type: 'trigger.manual',
  name: id,
  position: { x, y },
  config: {},
  inputs: [],
  outputs: ['main'],
})

const workflow = (over: Partial<Workflow> = {}): Workflow => ({
  id: 'wf1',
  name: 'Test',
  description: '',
  nodes: [node('a'), node('b', 200)],
  connections: [
    {
      id: 'c1',
      sourceNodeId: 'a',
      sourceOutput: 'main',
      targetNodeId: 'b',
      targetInput: 'main',
    },
  ],
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
  ...over,
})

const setup = (wf: Workflow = workflow()) => {
  const onChange = vi.fn()
  const hook = renderHook(() => useWorkflowEditor(wf, onChange))
  return { ...hook, onChange }
}

describe('useWorkflowEditor', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  describe('committing', () => {
    it('reports every change to the caller', () => {
      const { result, onChange } = setup()

      act(() => {
        result.current.setName('Renamed')
      })

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(result.current.workflow.name).toBe('Renamed')
    })

    it('stamps updatedAt on each commit', () => {
      const { result } = setup()

      act(() => {
        result.current.setName('Renamed')
      })

      expect(result.current.workflow.updatedAt).not.toBe(
        '2020-01-01T00:00:00.000Z'
      )
    })

    it('does not mutate the workflow it was given', () => {
      const original = workflow()
      const { result } = setup(original)

      act(() => {
        result.current.deleteNode('a')
      })

      expect(original.nodes).toHaveLength(2)
      expect(result.current.workflow.nodes).toHaveLength(1)
    })
  })

  describe('zoom', () => {
    it('starts at 1', () => {
      expect(setup().result.current.zoom).toBe(1)
    })

    it('clamps zooming in at 2', () => {
      const { result } = setup()

      for (let i = 0; i < 30; i += 1) act(() => result.current.zoomIn())

      expect(result.current.zoom).toBeLessThanOrEqual(2)
      expect(result.current.zoom).toBeCloseTo(2)
    })

    it('clamps zooming out at 0.3', () => {
      const { result } = setup()

      for (let i = 0; i < 30; i += 1) act(() => result.current.zoomOut())

      expect(result.current.zoom).toBeGreaterThanOrEqual(0.3)
      expect(result.current.zoom).toBeCloseTo(0.3)
    })

    it('resets zoom and pan together', () => {
      const { result } = setup()

      act(() => result.current.zoomIn())
      act(() => result.current.zoomReset())

      expect(result.current.zoom).toBe(1)
      expect(result.current.canvasOffset).toEqual({ x: 0, y: 0 })
    })
  })

  describe('selection', () => {
    it('resolves the selected node from its id', () => {
      const { result } = setup()

      act(() => result.current.selectNode('b'))

      expect(result.current.selectedNode?.id).toBe('b')
    })

    it('has no selected node to begin with', () => {
      const { result } = setup()
      expect(result.current.selectedNode).toBeNull()
      expect(result.current.propertiesOpen).toBe(false)
    })

    it('resolves to null for an id that is no longer present', () => {
      const { result } = setup()

      act(() => result.current.selectNode('a'))
      act(() => result.current.deleteNode('a'))

      expect(result.current.selectedNode).toBeNull()
    })

    it('opens the properties panel on the node it selects', () => {
      const { result } = setup()

      act(() => result.current.openProps('a'))

      expect(result.current.selectedNodeId).toBe('a')
      expect(result.current.propertiesOpen).toBe(true)
    })
  })

  describe('node editing', () => {
    it('updates one node config and leaves the rest alone', () => {
      const { result } = setup()

      act(() => result.current.updateConfig('a', { url: 'x' }))

      const nodes = result.current.workflow.nodes
      expect(nodes.find(n => n.id === 'a')?.config).toEqual({ url: 'x' })
      expect(nodes.find(n => n.id === 'b')?.config).toEqual({})
    })

    it('renames one node', () => {
      const { result } = setup()

      act(() => result.current.updateName('a', 'Fetch'))

      expect(result.current.workflow.nodes[0].name).toBe('Fetch')
    })

    it('deletes the connections attached to a deleted node', () => {
      // A dangling connection would render as a line to nowhere.
      const { result } = setup()

      act(() => result.current.deleteNode('b'))

      expect(result.current.workflow.connections).toEqual([])
    })

    it('closes the properties panel after a delete', () => {
      const { result } = setup()

      act(() => result.current.openProps('a'))
      act(() => result.current.deleteNode('a'))

      expect(result.current.propertiesOpen).toBe(false)
      expect(result.current.selectedNodeId).toBeNull()
    })

    it('ignores a delete for an unknown node', () => {
      const { result } = setup()

      act(() => result.current.deleteNode('nope'))

      expect(result.current.workflow.nodes).toHaveLength(2)
    })
  })

  describe('drawing connections', () => {
    it('records the pending connection on start', () => {
      const { result } = setup()

      act(() => result.current.onConnectionStart('a', 'main', { x: 10, y: 20 }))

      expect(result.current.drawing).toEqual({
        sourceNodeId: 'a',
        sourceOutput: 'main',
        position: { x: 10, y: 20 },
      })
    })

    it('commits a connection between two different nodes', () => {
      const { result } = setup(workflow({ connections: [] }))

      act(() => result.current.onConnectionStart('a', 'main', { x: 0, y: 0 }))
      act(() => result.current.onConnectionEnd('b', 'main'))

      expect(result.current.workflow.connections).toHaveLength(1)
      expect(result.current.workflow.connections[0]).toMatchObject({
        sourceNodeId: 'a',
        targetNodeId: 'b',
      })
      expect(result.current.drawing).toBeNull()
    })

    it('refuses to connect a node to itself', () => {
      const { result } = setup(workflow({ connections: [] }))

      act(() => result.current.onConnectionStart('a', 'main', { x: 0, y: 0 }))
      act(() => result.current.onConnectionEnd('a', 'main'))

      expect(result.current.workflow.connections).toEqual([])
      expect(result.current.drawing).toBeNull()
    })

    it('ignores an end with no start', () => {
      const { result } = setup(workflow({ connections: [] }))

      act(() => result.current.onConnectionEnd('b', 'main'))

      expect(result.current.workflow.connections).toEqual([])
    })
  })

  describe('node types', () => {
    it('answers undefined for a type that is not registered', () => {
      const { result } = setup()
      expect(result.current.getNodeType('not.a.type')).toBeUndefined()
    })
  })

  describe('canvas drag and drop', () => {
    /** A canvasRef is a plain object at runtime; its type only marks
     *  .current readonly to discourage mutation from outside the hook. */
    const attachCanvas = (
      result: { current: ReturnType<typeof useWorkflowEditor> },
      rect: Partial<DOMRect> = {}
    ): void => {
      const div = document.createElement('div')
      vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        ...rect,
      } as DOMRect)
      ;(
        result.current.canvasRef as { current: HTMLDivElement | null }
      ).current = div
    }

    const dragEvent = (
      data: Record<string, string> = {}
    ): React.DragEvent => {
      const store = { ...data }
      return {
        preventDefault: vi.fn(),
        clientX: 0,
        clientY: 0,
        dataTransfer: {
          setData: (key: string, value: string) => {
            store[key] = value
          },
          getData: (key: string) => store[key] ?? '',
          effectAllowed: '',
          dropEffect: '',
        },
      } as unknown as React.DragEvent
    }

    it('marks a palette item copyable when the drag starts', () => {
      const { result } = setup()
      const event = dragEvent()
      act(() => {
        result.current.onPaletteDragStart(event, {
          type: 'trigger.manual',
          name: 'Manual',
          defaultConfig: {},
          inputs: [],
          outputs: ['main'],
        } as never)
      })
      expect(event.dataTransfer.effectAllowed).toBe('copy')
    })

    it('allows a drop over the canvas', () => {
      const { result } = setup()
      const event = dragEvent()
      act(() => {
        result.current.onCanvasDragOver(event)
      })
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.dataTransfer.dropEffect).toBe('copy')
    })

    it('adds a node where the drop landed', () => {
      const { result } = setup(workflow({ nodes: [] }))
      attachCanvas(result)
      const event = dragEvent({ 'application/node-type': 'trigger' })

      act(() => {
        result.current.onCanvasDrop(event)
      })

      expect(result.current.workflow.nodes).toHaveLength(1)
      expect(result.current.workflow.nodes[0]?.type).toBe('trigger')
    })

    it('does nothing for a drop naming no real node type', () => {
      const { result, onChange } = setup(workflow({ nodes: [] }))
      attachCanvas(result)
      const event = dragEvent({ 'application/node-type': 'not.a.type' })

      act(() => {
        result.current.onCanvasDrop(event)
      })

      expect(result.current.workflow.nodes).toHaveLength(0)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does nothing when the canvas has not mounted yet', () => {
      const { result } = setup(workflow({ nodes: [] }))
      const event = dragEvent({ 'application/node-type': 'trigger' })

      act(() => {
        result.current.onCanvasDrop(event)
      })

      expect(result.current.workflow.nodes).toHaveLength(0)
    })
  })

  describe('panning', () => {
    const mouseDown = (target: EventTarget): React.MouseEvent =>
      ({ target, clientX: 10, clientY: 10 } as unknown as React.MouseEvent)

    it('starts panning on a mousedown that hits the canvas itself', () => {
      const { result } = setup()
      const div = document.createElement('div')
      ;(
        result.current.canvasRef as { current: HTMLDivElement | null }
      ).current = div

      act(() => {
        result.current.onCanvasMouseDown(mouseDown(div))
      })

      expect(result.current.isPanning).toBe(true)
    })

    it('ignores a mousedown on something else on the canvas', () => {
      const { result } = setup()
      const div = document.createElement('div')
      ;(
        result.current.canvasRef as { current: HTMLDivElement | null }
      ).current = div
      const child = document.createElement('span')

      act(() => {
        result.current.onCanvasMouseDown(mouseDown(child))
      })

      expect(result.current.isPanning).toBe(false)
    })

    it('moves the canvas offset as the mouse moves, and stops on mouseup', () => {
      const { result } = setup()
      const div = document.createElement('div')
      ;(
        result.current.canvasRef as { current: HTMLDivElement | null }
      ).current = div

      act(() => {
        result.current.onCanvasMouseDown(mouseDown(div))
      })
      act(() => {
        window.dispatchEvent(
          new MouseEvent('mousemove', { clientX: 40, clientY: 25 })
        )
      })
      expect(result.current.canvasOffset).toEqual({ x: 30, y: 15 })

      act(() => {
        window.dispatchEvent(new MouseEvent('mouseup'))
      })
      expect(result.current.isPanning).toBe(false)
    })
  })

  describe('dragging a node', () => {
    it('moves the node as the mouse moves, and reports the change on release', () => {
      const { result, onChange } = setup()

      act(() => {
        result.current.onNodeDragStart(
          { clientX: 0, clientY: 0 } as unknown as React.MouseEvent,
          'a'
        )
      })
      act(() => {
        window.dispatchEvent(
          new MouseEvent('mousemove', { clientX: 20, clientY: 5 })
        )
      })
      const moved = result.current.workflow.nodes.find(n => n.id === 'a')
      expect(moved?.position).toEqual({ x: 20, y: 5 })
      expect(onChange).not.toHaveBeenCalled()

      act(() => {
        window.dispatchEvent(new MouseEvent('mouseup'))
      })
      expect(onChange).toHaveBeenCalledWith(result.current.workflow)
    })

    it('does nothing for a node id that does not exist', () => {
      const { result } = setup()

      act(() => {
        result.current.onNodeDragStart(
          { clientX: 0, clientY: 0 } as unknown as React.MouseEvent,
          'ghost'
        )
      })
      act(() => {
        window.dispatchEvent(
          new MouseEvent('mousemove', { clientX: 20, clientY: 5 })
        )
      })

      expect(result.current.workflow.nodes.map(n => n.position)).toEqual([
        { x: 0, y: 0 },
        { x: 200, y: 0 },
      ])
    })
  })

  describe('zoom controls', () => {
    it('narrows on a wheel scroll down', () => {
      const { result } = setup()
      act(() => {
        result.current.onWheel({ deltaY: 100 } as React.WheelEvent)
      })
      expect(result.current.zoom).toBeLessThan(1)
    })

    it('widens on a wheel scroll up', () => {
      const { result } = setup()
      act(() => {
        result.current.onWheel({ deltaY: -100 } as React.WheelEvent)
      })
      expect(result.current.zoom).toBeGreaterThan(1)
    })

    it('resets zoom and offset together', () => {
      const { result } = setup()
      act(() => result.current.zoomIn())
      act(() => {
        result.current.onCanvasMouseDown({
          target: null,
        } as unknown as React.MouseEvent)
      })
      act(() => result.current.zoomReset())
      expect(result.current.zoom).toBe(1)
      expect(result.current.canvasOffset).toEqual({ x: 0, y: 0 })
    })
  })
})
