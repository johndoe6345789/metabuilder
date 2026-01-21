import { Middleware } from '@reduxjs/toolkit'
import { RootState } from '../index'

interface SyncMetrics {
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  lastOperationTime: number
  averageOperationTime: number
  operationTimes: number[]
}

class SyncMonitor {
  private metrics: SyncMetrics = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    lastOperationTime: 0,
    averageOperationTime: 0,
    operationTimes: [],
  }

  private operationStartTimes: Map<string, number> = new Map()
  private listeners: Set<(metrics: SyncMetrics) => void> = new Set()

  startOperation(operationId: string) {
    this.operationStartTimes.set(operationId, Date.now())
  }

  endOperation(operationId: string, success: boolean) {
    const startTime = this.operationStartTimes.get(operationId)
    if (!startTime) return

    const duration = Date.now() - startTime
    this.operationStartTimes.delete(operationId)

    this.metrics.totalOperations++
    if (success) {
      this.metrics.successfulOperations++
    } else {
      this.metrics.failedOperations++
    }

    this.metrics.lastOperationTime = Date.now()
    this.metrics.operationTimes.push(duration)

    if (this.metrics.operationTimes.length > 100) {
      this.metrics.operationTimes.shift()
    }

    this.metrics.averageOperationTime =
      this.metrics.operationTimes.reduce((a, b) => a + b, 0) / this.metrics.operationTimes.length

    this.notifyListeners()
  }

  getMetrics(): SyncMetrics {
    return { ...this.metrics }
  }

  subscribe(listener: (metrics: SyncMetrics) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.getMetrics()))
  }

  reset() {
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      lastOperationTime: 0,
      averageOperationTime: 0,
      operationTimes: [],
    }
    this.notifyListeners()
  }
}

export const syncMonitor = new SyncMonitor()

export const createSyncMonitorMiddleware = (): Middleware => {
  return () => (next) => (action: any) => {
    if (!action.type) return next(action)

    const asyncThunkActions = [
      'files/saveFile',
      'files/deleteFile',
      'models/saveModel',
      'models/deleteModel',
      'components/saveComponent',
      'components/deleteComponent',
      'componentTrees/saveComponentTree',
      'componentTrees/deleteComponentTree',
      'workflows/saveWorkflow',
      'workflows/deleteWorkflow',
      'lambdas/saveLambda',
      'lambdas/deleteLambda',
      'sync/syncToFlaskBulk',
      'sync/syncFromFlaskBulk',
    ]

    const isPendingAction = asyncThunkActions.some((prefix) => action.type === `${prefix}/pending`)
    const isFulfilledAction = asyncThunkActions.some((prefix) => action.type === `${prefix}/fulfilled`)
    const isRejectedAction = asyncThunkActions.some((prefix) => action.type === `${prefix}/rejected`)

    if (isPendingAction && action.meta?.requestId) {
      syncMonitor.startOperation(action.meta.requestId)
    }

    const result = next(action)

    if (isFulfilledAction && action.meta?.requestId) {
      syncMonitor.endOperation(action.meta.requestId, true)
    }

    if (isRejectedAction && action.meta?.requestId) {
      syncMonitor.endOperation(action.meta.requestId, false)
    }

    return result
  }
}

export const getSyncMetrics = () => syncMonitor.getMetrics()
export const resetSyncMetrics = () => syncMonitor.reset()
export const subscribeSyncMetrics = (listener: (metrics: SyncMetrics) => void) =>
  syncMonitor.subscribe(listener)
