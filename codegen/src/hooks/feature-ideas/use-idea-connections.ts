import { useCallback } from 'react'
import { useKV } from '@/hooks/use-kv'
import { Edge, MarkerType } from 'reactflow'
import { toast } from 'sonner'

export interface IdeaEdgeData {
  label?: string
}

const DEFAULT_EDGES: Edge<IdeaEdgeData>[] = [
  {
    id: 'edge-1',
    source: 'idea-1',
    target: 'idea-8',
    sourceHandle: 'right-0',
    targetHandle: 'left-0',
    type: 'default',
    animated: false,
    data: { label: 'requires' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a78bfa', width: 20, height: 20 },
    style: { stroke: '#a78bfa', strokeWidth: 2.5 },
  },
]

export const CONNECTION_STYLE = { 
  stroke: '#a78bfa', 
  strokeWidth: 2.5
}

export function useIdeaConnections() {
  const [edges, setEdges] = useKV<Edge<IdeaEdgeData>[]>('feature-idea-edges', DEFAULT_EDGES)

  const validateAndRemoveConflicts = useCallback((
    currentEdges: Edge<IdeaEdgeData>[],
    sourceNodeId: string,
    sourceHandleId: string,
    targetNodeId: string,
    targetHandleId: string,
    excludeEdgeId?: string
  ): { filteredEdges: Edge<IdeaEdgeData>[], removedCount: number, conflicts: string[] } => {
    const edgesToRemove: string[] = []
    const conflicts: string[] = []
    
    currentEdges.forEach(edge => {
      if (excludeEdgeId && edge.id === excludeEdgeId) return
      
      const edgeSourceHandle = edge.sourceHandle || 'default'
      const edgeTargetHandle = edge.targetHandle || 'default'
      
      const hasSourceConflict = edge.source === sourceNodeId && edgeSourceHandle === sourceHandleId
      const hasTargetConflict = edge.target === targetNodeId && edgeTargetHandle === targetHandleId
      
      if (hasSourceConflict && !edgesToRemove.includes(edge.id)) {
        edgesToRemove.push(edge.id)
        conflicts.push(`Source: ${edge.source}[${edgeSourceHandle}] was connected to ${edge.target}[${edgeTargetHandle}]`)
      }
      
      if (hasTargetConflict && !edgesToRemove.includes(edge.id)) {
        edgesToRemove.push(edge.id)
        conflicts.push(`Target: ${edge.target}[${edgeTargetHandle}] was connected from ${edge.source}[${edgeSourceHandle}]`)
      }
    })
    
    const filteredEdges = currentEdges.filter(e => !edgesToRemove.includes(e.id))
    
    return { 
      filteredEdges, 
      removedCount: edgesToRemove.length,
      conflicts
    }
  }, [])

  const createConnection = useCallback((
    sourceNodeId: string,
    sourceHandleId: string,
    targetNodeId: string,
    targetHandleId: string
  ) => {
    setEdges((current) => {
      const { filteredEdges, removedCount, conflicts } = validateAndRemoveConflicts(
        current || [],
        sourceNodeId,
        sourceHandleId,
        targetNodeId,
        targetHandleId
      )
      
      const newEdge: Edge<IdeaEdgeData> = {
        id: `edge-${Date.now()}`,
        source: sourceNodeId,
        target: targetNodeId,
        sourceHandle: sourceHandleId,
        targetHandle: targetHandleId,
        type: 'default',
        data: { label: 'relates to' },
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          color: CONNECTION_STYLE.stroke,
          width: 20,
          height: 20
        },
        style: { 
          stroke: CONNECTION_STYLE.stroke, 
          strokeWidth: CONNECTION_STYLE.strokeWidth
        },
        animated: false,
      }
      
      const updatedEdges = [...filteredEdges, newEdge]
      
      if (removedCount > 0) {
        setTimeout(() => {
          toast.success(`Connection remapped! (${removedCount} old connection${removedCount > 1 ? 's' : ''} removed)`, {
            description: conflicts.join('\n')
          })
        }, 0)
      } else {
        setTimeout(() => {
          toast.success('Ideas connected!')
        }, 0)
      }
      
      return updatedEdges
    })
  }, [setEdges, validateAndRemoveConflicts])

  const updateConnection = useCallback((edgeId: string, updates: Partial<Edge<IdeaEdgeData>>) => {
    setEdges((current) => 
      (current || []).map(edge => 
        edge.id === edgeId ? { ...edge, ...updates } : edge
      )
    )
  }, [setEdges])

  const deleteConnection = useCallback((edgeId: string) => {
    setEdges((current) => (current || []).filter(edge => edge.id !== edgeId))
    toast.success('Connection removed')
  }, [setEdges])

  return {
    edges: edges || DEFAULT_EDGES,
    setEdges,
    createConnection,
    updateConnection,
    deleteConnection,
    validateAndRemoveConflicts,
  }
}
