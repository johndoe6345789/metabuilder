import { useCallback } from 'react'
import { useKV } from '@/hooks/use-kv'

export function useNodePositions() {
  const [positions, setPositions] = useKV<Record<string, { x: number; y: number }>>('feature-idea-node-positions', {})

  const updatePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setPositions((current) => ({
      ...(current || {}),
      [nodeId]: position
    }))
  }, [setPositions])

  const updatePositions = useCallback((updates: Record<string, { x: number; y: number }>) => {
    setPositions((current) => ({
      ...(current || {}),
      ...updates
    }))
  }, [setPositions])

  const deletePosition = useCallback((nodeId: string) => {
    setPositions((current) => {
      const newPositions = { ...(current || {}) }
      delete newPositions[nodeId]
      return newPositions
    })
  }, [setPositions])

  const getPosition = useCallback((nodeId: string) => {
    return positions?.[nodeId]
  }, [positions])

  return {
    positions: positions || {},
    updatePosition,
    updatePositions,
    deletePosition,
    getPosition,
  }
}
