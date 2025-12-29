import { describe, expect, it } from 'vitest'

import { getSeverityColor, getSeverityIcon } from '@/lib/security-scanner'

describe('security-scanner reporting', () => {
  describe('getSeverityColor', () => {
    it.each([
      { severity: 'critical', expected: 'error' },
      { severity: 'high', expected: 'warning' },
      { severity: 'medium', expected: 'info' },
      { severity: 'low', expected: 'secondary' },
      { severity: 'safe', expected: 'success' },
    ])('should map $severity to expected classes', ({ severity, expected }) => {
      expect(getSeverityColor(severity)).toBe(expected)
    })
  })

  describe('getSeverityIcon', () => {
    it.each([
      { severity: 'critical', expected: '\u{1F6A8}' },
      { severity: 'high', expected: '\u26A0\uFE0F' },
      { severity: 'medium', expected: '\u26A1' },
      { severity: 'low', expected: '\u2139\uFE0F' },
      { severity: 'safe', expected: '\u2713' },
    ])('should map $severity to expected icon', ({ severity, expected }) => {
      expect(getSeverityIcon(severity)).toBe(expected)
    })
  })
})
