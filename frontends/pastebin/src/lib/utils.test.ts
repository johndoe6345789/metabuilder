import { cn, formatBytes, debounce, sleep } from './utils'

describe('utils', () => {
  describe('cn', () => {
    test('combines single class', () => {
      expect(cn('bg-blue-500')).toBe('bg-blue-500')
    })

    test('combines multiple classes', () => {
      expect(cn('bg-blue-500', 'text-white', 'p-4')).toBe('bg-blue-500 text-white p-4')
    })

    test('filters out undefined values', () => {
      expect(cn('bg-blue-500', undefined, 'text-white')).toBe('bg-blue-500 text-white')
    })

    test('filters out null values', () => {
      expect(cn('bg-blue-500', null, 'text-white')).toBe('bg-blue-500 text-white')
    })

    test('filters out false values', () => {
      expect(cn('bg-blue-500', false, 'text-white')).toBe('bg-blue-500 text-white')
    })

    test('handles all falsy values', () => {
      expect(cn('active', undefined, null, false, '', 'inactive')).toBe('active inactive')
    })

    test('handles empty input', () => {
      expect(cn()).toBe('')
    })

    test('handles all falsy input', () => {
      expect(cn(undefined, null, false)).toBe('')
    })

    test('preserves order of classes', () => {
      expect(cn('z-10', 'absolute', 'top-0')).toBe('z-10 absolute top-0')
    })

    test('handles conditional classes', () => {
      const isActive = true
      expect(cn(isActive && 'active', 'base')).toBe('active base')
    })

    test('handles conditional classes false case', () => {
      const isActive = false
      expect(cn(isActive && 'active', 'base')).toBe('base')
    })
  })

  describe('formatBytes', () => {
    test('formats zero bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
    })

    test('formats bytes', () => {
      expect(formatBytes(100)).toBe('100 Bytes')
    })

    test('formats kilobytes', () => {
      const result = formatBytes(1024)
      expect(result).toMatch(/^1 KB$/)
    })

    test('formats megabytes', () => {
      const result = formatBytes(1024 * 1024)
      expect(result).toMatch(/^1 MB$/)
    })

    test('formats gigabytes', () => {
      const result = formatBytes(1024 * 1024 * 1024)
      expect(result).toMatch(/^1 GB$/)
    })

    test('rounds decimal places', () => {
      const result = formatBytes(1536) // 1.5 KB
      expect(result).toMatch(/1.5 KB/)
    })

    test('handles fractional bytes', () => {
      const result = formatBytes(512)
      expect(result).toBe('512 Bytes')
    })

    test('formats small files correctly', () => {
      expect(formatBytes(100)).toMatch(/100 Bytes/)
    })

    test('formats medium files correctly', () => {
      const result = formatBytes(2048 * 1024) // ~2 MB
      expect(result).toMatch(/2 MB/)
    })

    test('handles large numbers', () => {
      const result = formatBytes(Math.pow(1024, 3) * 5) // 5 GB
      expect(result).toMatch(/5 GB/)
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })

    test('debounces function calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')

      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg3')
    })

    test('calls function with latest arguments', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('first')
      jest.advanceTimersByTime(50)
      debouncedFn('second')
      jest.advanceTimersByTime(50)
      debouncedFn('third')

      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledWith('third')
    })

    test('resets timer on each call', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg')
      jest.advanceTimersByTime(50)
      expect(mockFn).not.toHaveBeenCalled()

      debouncedFn('arg')
      jest.advanceTimersByTime(50)
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('handles multiple arguments', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1', 'arg2', 'arg3')

      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })

    test('handles no arguments', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()

      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith()
    })

    test('uses provided wait time', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 250)

      debouncedFn('arg')

      jest.advanceTimersByTime(200)
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(50)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('clears timeout when cancelled', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1')
      jest.advanceTimersByTime(50)
      debouncedFn('arg2')

      // At this point, timer should be reset
      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('sleep', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test('resolves after specified time', async () => {
      const promise = sleep(100)

      jest.advanceTimersByTime(100)
      await promise

      expect(true).toBe(true) // Just verify it resolves
    })

    test('returns a promise', () => {
      const result = sleep(100)
      expect(result).toBeInstanceOf(Promise)
    })

    test('handles zero milliseconds', async () => {
      const promise = sleep(0)
      jest.advanceTimersByTime(0)
      await promise

      expect(true).toBe(true)
    })

    test('resolves correctly with different times', async () => {
      const promise1 = sleep(50)
      const promise2 = sleep(100)

      jest.advanceTimersByTime(50)
      await promise1

      jest.advanceTimersByTime(50)
      await promise2

      expect(true).toBe(true)
    })

    test('can be used in async/await', async () => {
      let executed = false

      const asyncFn = async () => {
        await sleep(100)
        executed = true
      }

      const promise = asyncFn()
      jest.advanceTimersByTime(100)
      await promise

      expect(executed).toBe(true)
    })
  })
})
