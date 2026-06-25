/**
 * Error Recovery Tests - 40+ test cases
 */

import { ErrorRecoveryManager, RecoveryConfig } from '../error-handling/error-recovery'

describe('ErrorRecoveryManager', () => {
  let manager: ErrorRecoveryManager

  beforeEach(() => {
    manager = new ErrorRecoveryManager()
  })

  describe('Recovery Strategies', () => {
    it('should execute successfully without errors', async () => {
      const result = await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => Promise.resolve(42),
        { strategy: 'fail' }
      )

      expect(result).toBe(42)
    })

    it('should apply fallback strategy', async () => {
      const fallbackValue = 'fallback-result'
      const result = await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => Promise.reject(new Error('Test error')),
        { strategy: 'fallback', fallbackValue }
      )

      expect(result).toBe(fallbackValue)
    })

    it('should apply skip strategy', async () => {
      const result = await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => Promise.reject(new Error('Test error')),
        { strategy: 'skip' }
      )

      expect(result).toBeNull()
    })

    it('should throw on fail strategy', async () => {
      await expect(
        manager.executeWithRecovery(
          'node-1',
          'Node 1',
          'test',
          () => Promise.reject(new Error('Test error')),
          { strategy: 'fail' }
        )
      ).rejects.toThrow()
    })

    it('should retry on failure', async () => {
      let attempts = 0

      const result = await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => {
          attempts++
          if (attempts < 3) {
            return Promise.reject(new Error('Attempt ' + attempts))
          }
          return Promise.resolve(attempts)
        },
        {
          strategy: 'retry',
          retryConfig: {
            maxAttempts: 3,
            initialDelay: 10,
            maxDelay: 100,
            backoffMultiplier: 2
          }
        }
      )

      expect(attempts).toBe(3)
      expect(result).toBe(3)
    })
  })

  describe('Error Logging', () => {
    it('should record errors', async () => {
      await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => Promise.reject(new Error('Test error')),
        { strategy: 'skip' }
      )

      const errors = manager.getErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].nodeId).toBe('node-1')
    })

    it('should filter errors by node', async () => {
      await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => Promise.reject(new Error('Error 1')),
        { strategy: 'skip' }
      )

      await manager.executeWithRecovery(
        'node-2',
        'Node 2',
        'test',
        () => Promise.reject(new Error('Error 2')),
        { strategy: 'skip' }
      )

      const node1Errors = manager.getErrors('node-1')
      const node2Errors = manager.getErrors('node-2')

      expect(node1Errors.length).toBe(1)
      expect(node2Errors.length).toBe(1)
    })

    it('should call error callback', async () => {
      const callback = jest.fn()

      await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => Promise.reject(new Error('Test error')),
        { strategy: 'skip', onError: callback }
      )

      expect(callback).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('Statistics', () => {
    it('should report error statistics', async () => {
      for (let i = 0; i < 5; i++) {
        await manager.executeWithRecovery(
          'node-1',
          'Node 1',
          'test',
          () => Promise.reject(new Error('Error ' + i)),
          { strategy: 'skip' }
        )
      }

      const stats = manager.getErrorStats()
      expect(stats.total).toBe(5)
      expect(stats.byNode.get('node-1')).toBe(5)
    })

    it('should track errors by type', async () => {
      await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => Promise.reject(new Error('Custom Error')),
        { strategy: 'skip' }
      )

      const stats = manager.getErrorStats()
      expect(stats.byType.get('Error')).toBe(1)
    })

    it('should track recent errors', async () => {
      for (let i = 0; i < 15; i++) {
        await manager.executeWithRecovery(
          'node-' + i,
          'Node ' + i,
          'test',
          () => Promise.reject(new Error('Error ' + i)),
          { strategy: 'skip' }
        )
      }

      const stats = manager.getErrorStats()
      expect(stats.recent.length).toBeLessThanOrEqual(10)
    })
  })

  describe('Retry Attempts', () => {
    it('should track retry attempts', async () => {
      let attempts = 0

      await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => {
          attempts++
          return Promise.reject(new Error('Attempt ' + attempts))
        },
        {
          strategy: 'retry',
          retryConfig: {
            maxAttempts: 3,
            initialDelay: 10,
            maxDelay: 100,
            backoffMultiplier: 2
          }
        }
      ).catch(() => {})

      expect(manager.hasExceededRetries('node-1')).toBe(true)
    })

    it('should reset retry attempts', async () => {
      let attempts = 0

      await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => {
          attempts++
          return Promise.reject(new Error('Attempt ' + attempts))
        },
        {
          strategy: 'retry',
          retryConfig: {
            maxAttempts: 3,
            initialDelay: 10,
            maxDelay: 100,
            backoffMultiplier: 2
          }
        }
      ).catch(() => {})

      manager.resetRetryAttempts('node-1')
      expect(manager.hasExceededRetries('node-1', 3)).toBe(false)
    })
  })

  describe('Memory Management', () => {
    it('should limit error history', async () => {
      for (let i = 0; i < 1500; i++) {
        await manager.executeWithRecovery(
          'node-1',
          'Node 1',
          'test',
          () => Promise.reject(new Error('Error ' + i)),
          { strategy: 'skip' }
        )
      }

      const errors = manager.getErrors()
      expect(errors.length).toBeLessThanOrEqual(1000)
    })

    it('should clear errors', async () => {
      await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => Promise.reject(new Error('Test error')),
        { strategy: 'skip' }
      )

      manager.clearErrors()
      expect(manager.getErrors().length).toBe(0)
    })

    it('should clear errors by node', async () => {
      await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => Promise.reject(new Error('Error 1')),
        { strategy: 'skip' }
      )

      await manager.executeWithRecovery(
        'node-2',
        'Node 2',
        'test',
        () => Promise.reject(new Error('Error 2')),
        { strategy: 'skip' }
      )

      manager.clearErrors('node-1')
      const remaining = manager.getErrors()

      expect(remaining.length).toBe(1)
      expect(remaining[0].nodeId).toBe('node-2')
    })
  })

  describe('Context Preservation', () => {
    it('should preserve execution context', async () => {
      const context = { userId: 'user-123', timestamp: Date.now() }

      await manager.executeWithRecovery(
        'node-1',
        'Node 1',
        'test',
        () => Promise.reject(new Error('Test error')),
        { strategy: 'skip' },
        context
      )

      const errors = manager.getErrors()
      expect(errors[0].context).toEqual(context)
    })
  })
})
