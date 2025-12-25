import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it.each([
      {
        input: ['px-2 py-1', 'px-3'],
        shouldContain: ['py-1', 'px-3'],
        shouldNotContain: ['px-2'],
        description: 'merge conflicting tailwind classes',
      },
      {
        input: ['px-2', false && 'py-1', true && 'py-2'],
        shouldContain: ['px-2', 'py-2'],
        shouldNotContain: ['py-1'],
        description: 'handle conditional classes',
      },
      {
        input: [{ 'px-2': true, 'py-1': false, 'py-2': true }],
        shouldContain: ['px-2', 'py-2'],
        shouldNotContain: ['py-1'],
        description: 'handle object syntax',
      },
      {
        input: ['px-2 py-1 bg-red-500', 'px-3 bg-blue-500'],
        shouldContain: ['px-3', 'py-1', 'bg-blue-500'],
        shouldNotContain: ['px-2', 'bg-red-500'],
        description: 'merge tailwind classes with proper precedence',
      },
      {
        input: ['px-2', undefined, null, 'py-1'],
        shouldContain: ['px-2', 'py-1'],
        shouldNotContain: [],
        description: 'handle undefined and null',
      },
      {
        input: [['px-2', 'py-1'], 'bg-red-500'],
        shouldContain: ['px-2', 'py-1', 'bg-red-500'],
        shouldNotContain: [],
        description: 'handle arrays of classes',
      },
    ])('should $description', ({ input, shouldContain, shouldNotContain }) => {
      const result = cn(...(input as any))
      shouldContain.forEach(cls => {
        expect(result).toContain(cls)
      })
      shouldNotContain.forEach(cls => {
        expect(result).not.toContain(cls)
      })
    })

    it('should handle empty input', () => {
      const result = cn('')
      expect(typeof result).toBe('string')
    })

    it('should return string type', () => {
      const result = cn('px-2', 'py-1', 'bg-red-500', 'text-white')
      expect(typeof result).toBe('string')
    })
  })
})
