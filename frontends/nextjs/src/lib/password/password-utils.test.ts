import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  generateScrambledPassword,
  generateDeterministicScrambledPassword,
  simulateEmailSend,
  DEFAULT_SMTP_CONFIG,
} from '@/lib/password-utils'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

describe('password-utils', () => {
  describe('generateScrambledPassword', () => {
    beforeEach(() => {
      vi.stubGlobal('crypto', {
        getRandomValues: (array: Uint8Array) => {
          for (let i = 0; i < array.length; i++) {
            array[i] = i
          }
          return array
        },
      } as Crypto)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it.each([
      { name: 'use provided length', length: 5 },
      { name: 'default to length 16', length: undefined },
      { name: 'support longer lengths', length: 24 },
    ])('should $name', ({ length }) => {
      const password = length === undefined ? generateScrambledPassword() : generateScrambledPassword(length)
      const expectedLength = length ?? 16
      const expected = Array.from({ length: expectedLength }, (_, index) => CHARSET[index % CHARSET.length]).join('')

      expect(password).toBe(expected)
      expect(password.length).toBe(expectedLength)
    })
  })

  describe('generateDeterministicScrambledPassword', () => {
    const allowed = new Set(CHARSET.split(''))

    it.each([
      { seed: 'alpha', length: 16 },
      { seed: 'beta', length: 8 },
      { seed: 'gamma', length: undefined },
    ])('should return a password with valid characters for seed $seed', ({ seed, length }) => {
      const password = generateDeterministicScrambledPassword(seed, length)
      const expectedLength = length ?? 16

      expect(password.length).toBe(expectedLength)
      for (const char of password) {
        expect(allowed.has(char)).toBe(true)
      }
    })

    it.each([
      { seed: 'consistent', length: 12 },
      { seed: 'same-seed', length: 20 },
    ])('should return the same output for seed $seed', ({ seed, length }) => {
      const first = generateDeterministicScrambledPassword(seed, length)
      const second = generateDeterministicScrambledPassword(seed, length)
      expect(first).toBe(second)
    })

    it.each([
      { seedA: 'alpha', seedB: 'beta', length: 16 },
      { seedA: 'same', seedB: 'different', length: 10 },
    ])('should differ for seeds $seedA and $seedB', ({ seedA, seedB, length }) => {
      const first = generateDeterministicScrambledPassword(seedA, length)
      const second = generateDeterministicScrambledPassword(seedB, length)
      expect(first).not.toBe(second)
    })
  })

  describe('simulateEmailSend', () => {
    it.each([
      { name: 'without smtp config', config: undefined, shouldLogSmtp: false },
      { name: 'with smtp config', config: DEFAULT_SMTP_CONFIG, shouldLogSmtp: true },
    ])('should return success $name', async ({ config, shouldLogSmtp }) => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = await simulateEmailSend('test@example.com', 'Hello', 'Body', config)
      expect(result).toEqual({
        success: true,
        message: 'Email simulated successfully (check console)',
      })

      const logged = logSpy.mock.calls.flat().join(' ')
      if (shouldLogSmtp && config) {
        expect(logged).toContain(`SMTP Host: ${config.host}:${config.port}`)
        expect(logged).toContain(`From: ${config.fromEmail}`)
      } else {
        expect(logged).not.toContain('SMTP Host:')
      }

      logSpy.mockRestore()
    })
  })
})
