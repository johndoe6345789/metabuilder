import type { ClassValue } from 'clsx'
import { describe, expect, it } from 'vitest'

import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    // Note: cn() uses clsx, which concatenates classes without smart Tailwind merging
    const cases: Array<{
      input: ClassValue[]
      shouldContain: string[]
      shouldNotContain: string[]
      description: string
    }> = [
      {
        input: ['px-2 py-1', 'px-3'],
        shouldContain: ['px-2', 'py-1', 'px-3'],
        shouldNotContain: [],
        description: 'concatenate classes (no tailwind deduplication)',
      },
      {
        input: ['px-2', 'py-2'],
        shouldContain: ['px-2', 'py-2'],
        shouldNotContain: [],
        description: 'handle simple classes',
      },
      {
        input: [{ 'px-2': true, 'py-1': false, 'py-2': true }],
        shouldContain: ['px-2', 'py-2'],
        shouldNotContain: ['py-1'],
        description: 'handle object syntax',
      },
      {
        input: ['px-2 py-1 bg-red-500', 'px-3 bg-blue-500'],
        shouldContain: ['px-2', 'px-3', 'py-1', 'bg-red-500', 'bg-blue-500'],
        shouldNotContain: [],
        description: 'concatenate all classes (no tailwind deduplication)',
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
    ]

    it.each(cases)('should $description', ({ input, shouldContain, shouldNotContain }) => {
      const result = cn(...input)
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
