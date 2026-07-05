'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  generateConnectionId,
  generateNodeId,
  NODE_TYPES,
  type Connection,
  type NodeType,
  type Position,
  type Workflow,
  type WorkflowNode,
} from '@/workflow-editor'

interface DrawingConnection {
  sourceNodeId: string
  sourceOutput: string
  position: Position
}

const MIN_ZOOM = 0.3
const MAX_ZOOM = 2

/** All n8n-editor interaction state for a single workflow. */
export function useWorkflowEditor(
  initial: Workflow,
  onChange: (wf: Workflow) => void,
) {
  const [workflow, setWorkflow] = useState<Workflow>(initial)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const [canvasOffset, setCanvasOffset] = useState<Position>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [drawing, setDrawing] = useState<DrawingConnection | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ kind: 'pan' | 'node'; id?: string; sx: number; sy: number; ox: number; oy: number } | null>(null)

  const commit = useCallback((wf: Workflow) => {
    const next = { ...wf, updatedAt: new Date().toISOString() }
    setWorkflow(next)
    onChange(next)
  }, [onChange])

  const getNodeType = useCallback(
    (type: string): NodeType | undefined => NODE_TYPES.find((n) => n.type === type),
    [],
  )

  // ── palette → canvas drop ────────────────────────────────
  const onPaletteDragStart = useCallback((e: React.DragEvent, nt: NodeType) => {
    e.dataTransfer.setData('application/node-type', nt.type)
    e.dataTransfer.effectAllowed = 'copy'
  }, [])

  const onCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'copy'
  }, [])

  const onCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/node-type')
    const nt = getNodeType(type)
    if (!nt || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const position: Position = {
      x: (e.clientX - rect.left - canvasOffset.x) / zoom - 90,
      y: (e.clientY - rect.top - canvasOffset.y) / zoom - 30,
    }
    const node: WorkflowNode = {
      id: generateNodeId(), type: nt.type, name: nt.name, position,
      config: { ...nt.defaultConfig }, inputs: nt.inputs, outputs: nt.outputs,
    }
    commit({ ...workflow, nodes: [...workflow.nodes, node] })
  }, [workflow, canvasOffset, zoom, getNodeType, commit])

  // ── pan + node move (shared window listeners) ────────────
  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== canvasRef.current && !(e.target as HTMLElement).dataset.canvas) return
    drag.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, ox: canvasOffset.x, oy: canvasOffset.y }
    setIsPanning(true)
  }, [canvasOffset])

  const onNodeDragStart = useCallback((e: React.MouseEvent, id: string) => {
    const n = workflow.nodes.find((x) => x.id === id)
    if (!n) return
    drag.current = { kind: 'node', id, sx: e.clientX, sy: e.clientY, ox: n.position.x, oy: n.position.y }
  }, [workflow])

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const d = drag.current
      if (!d) return
      const dx = (e.clientX - d.sx), dy = (e.clientY - d.sy)
      if (d.kind === 'pan') setCanvasOffset({ x: d.ox + dx, y: d.oy + dy })
      else if (d.id) {
        setWorkflow((wf) => ({
          ...wf,
          nodes: wf.nodes.map((n) => n.id === d.id
            ? { ...n, position: { x: d.ox + dx / zoom, y: d.oy + dy / zoom } } : n),
        }))
      }
    }
    const up = () => {
      if (drag.current?.kind === 'node') onChange(workflow)
      drag.current = null; setIsPanning(false)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [zoom, workflow, onChange])

  // ── zoom ─────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.001)))
  }, [])
  const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.1)), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.1)), [])
  const zoomReset = useCallback(() => { setZoom(1); setCanvasOffset({ x: 0, y: 0 }) }, [])

  // ── connections ──────────────────────────────────────────
  const onConnectionStart = useCallback((nodeId: string, output: string, position: Position) => {
    setDrawing({ sourceNodeId: nodeId, sourceOutput: output, position })
  }, [])
  const onConnectionEnd = useCallback((nodeId: string, input: string) => {
    setDrawing((d) => {
      if (d && d.sourceNodeId !== nodeId) {
        const conn: Connection = {
          id: generateConnectionId(), sourceNodeId: d.sourceNodeId,
          sourceOutput: d.sourceOutput, targetNodeId: nodeId, targetInput: input,
        }
        commit({ ...workflow, connections: [...workflow.connections, conn] })
      }
      return null
    })
  }, [workflow, commit])

  // ── node CRUD ────────────────────────────────────────────
  const selectNode = useCallback((id: string) => setSelectedNodeId(id), [])
  const openProps = useCallback((id: string) => { setSelectedNodeId(id); setPropertiesOpen(true) }, [])
  const updateConfig = useCallback((id: string, config: Record<string, unknown>) => {
    commit({ ...workflow, nodes: workflow.nodes.map((n) => n.id === id ? { ...n, config } : n) })
  }, [workflow, commit])
  const updateName = useCallback((id: string, name: string) => {
    commit({ ...workflow, nodes: workflow.nodes.map((n) => n.id === id ? { ...n, name } : n) })
  }, [workflow, commit])
  const deleteNode = useCallback((id: string) => {
    commit({
      ...workflow,
      nodes: workflow.nodes.filter((n) => n.id !== id),
      connections: workflow.connections.filter((c) => c.sourceNodeId !== id && c.targetNodeId !== id),
    })
    setPropertiesOpen(false); setSelectedNodeId(null)
  }, [workflow, commit])

  const setName = useCallback((name: string) => commit({ ...workflow, name }), [workflow, commit])

  const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId) ?? null

  return {
    workflow, canvasRef, canvasOffset, zoom, isPanning, drawing,
    selectedNodeId, selectedNode, propertiesOpen, setPropertiesOpen,
    getNodeType, onPaletteDragStart, onCanvasDragOver, onCanvasDrop,
    onCanvasMouseDown, onNodeDragStart, onWheel, zoomIn, zoomOut, zoomReset,
    onConnectionStart, onConnectionEnd, selectNode, openProps,
    updateConfig, updateName, deleteNode, setName,
  }
}
