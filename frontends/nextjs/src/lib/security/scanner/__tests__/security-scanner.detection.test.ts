import { describe, expect, it } from 'vitest'

import { scanForVulnerabilities, securityScanner } from '@/lib/security-scanner'

describe('security-scanner detection', () => {
  describe('scanJavaScript', () => {
    it.each([
      {
        name: 'flag eval usage as critical',
        code: ['const safe = true;', 'const result = eval("1 + 1")'].join('\n'),
        expectedSeverity: 'critical',
        expectedSafe: false,
        expectedIssueType: 'dangerous',
        expectedIssuePattern: 'eval',
        expectedLine: 2,
      },
      {
        name: 'warn on localStorage usage but stay safe',
        code: 'localStorage.setItem("k", "v")',
        expectedSeverity: 'low',
        expectedSafe: true,
        expectedIssueType: 'warning',
        expectedIssuePattern: 'localStorage',
      },
      {
        name: 'return safe for benign code',
        code: 'const sum = (a, b) => a + b',
        expectedSeverity: 'safe',
        expectedSafe: true,
      },
    ])(
      'should $name',
      ({
        code,
        expectedSeverity,
        expectedSafe,
        expectedIssueType,
        expectedIssuePattern,
        expectedLine,
      }) => {
        const result = securityScanner.scanJavaScript(code)
        expect(result.severity).toBe(expectedSeverity)
        expect(result.safe).toBe(expectedSafe)

        if (expectedIssueType || expectedIssuePattern) {
          const issue = result.issues.find(item => {
            const matchesType = expectedIssueType ? item.type === expectedIssueType : true
            const matchesPattern = expectedIssuePattern
              ? item.pattern.includes(expectedIssuePattern)
              : true
            return matchesType && matchesPattern
          })
          expect(issue).toBeDefined()
          if (expectedLine !== undefined) {
            expect(issue?.line).toBe(expectedLine)
          }
        } else {
          expect(result.issues.length).toBe(0)
        }

        if (expectedSafe) {
          expect(result.sanitizedCode).toBe(code)
        } else {
          expect(result.sanitizedCode).toBeUndefined()
        }
      }
    )
  })

  describe('scanLua', () => {
    it.each([
      {
        name: 'flag os.execute usage as critical',
        code: 'os.execute("rm -rf /")',
        expectedSeverity: 'critical',
        expectedSafe: false,
        expectedIssueType: 'malicious',
        expectedIssuePattern: 'os.execute',
      },
      {
        name: 'return safe for simple Lua function',
        code: 'function add(a, b) return a + b end',
        expectedSeverity: 'safe',
        expectedSafe: true,
      },
    ])(
      'should $name',
      ({ code, expectedSeverity, expectedSafe, expectedIssueType, expectedIssuePattern }) => {
        const result = securityScanner.scanLua(code)
        expect(result.severity).toBe(expectedSeverity)
        expect(result.safe).toBe(expectedSafe)

        if (expectedIssueType || expectedIssuePattern) {
          const issue = result.issues.find(item => {
            const matchesType = expectedIssueType ? item.type === expectedIssueType : true
            const matchesPattern = expectedIssuePattern
              ? item.pattern.includes(expectedIssuePattern)
              : true
            return matchesType && matchesPattern
          })
          expect(issue).toBeDefined()
        } else {
          expect(result.issues.length).toBe(0)
        }

        if (expectedSafe) {
          expect(result.sanitizedCode).toBe(code)
        } else {
          expect(result.sanitizedCode).toBeUndefined()
        }
      }
    )
  })

  describe('scanJSON', () => {
    it.each([
      {
        name: 'flag invalid JSON as medium severity',
        json: '{"value": }',
        expectedSeverity: 'medium',
        expectedSafe: false,
        expectedIssuePattern: 'JSON parse error',
      },
      {
        name: 'flag prototype pollution in JSON as critical',
        json: '{"__proto__": {"polluted": true}}',
        expectedSeverity: 'critical',
        expectedSafe: false,
        expectedIssuePattern: '__proto__',
      },
      {
        name: 'return safe for valid JSON',
        json: '{"ok": true}',
        expectedSeverity: 'safe',
        expectedSafe: true,
      },
    ])('should $name', ({ json, expectedSeverity, expectedSafe, expectedIssuePattern }) => {
      const result = securityScanner.scanJSON(json)
      expect(result.severity).toBe(expectedSeverity)
      expect(result.safe).toBe(expectedSafe)

      if (expectedIssuePattern) {
        expect(result.issues.some(issue => issue.pattern.includes(expectedIssuePattern))).toBe(true)
      } else {
        expect(result.issues.length).toBe(0)
      }

      if (expectedSafe) {
        expect(result.sanitizedCode).toBe(json)
      } else {
        expect(result.sanitizedCode).toBeUndefined()
      }
    })
  })

  describe('scanHTML', () => {
    it.each([
      {
        name: 'flag script tags as critical',
        html: '<div><script>alert(1)</script></div>',
        expectedSeverity: 'critical',
        expectedSafe: false,
      },
      {
        name: 'flag inline handlers as high',
        html: '<button onclick="alert(1)">Click</button>',
        expectedSeverity: 'high',
        expectedSafe: false,
      },
      {
        name: 'return safe for plain markup',
        html: '<div><span>Safe</span></div>',
        expectedSeverity: 'safe',
        expectedSafe: true,
      },
    ])('should $name', ({ html, expectedSeverity, expectedSafe }) => {
      const result = securityScanner.scanHTML(html)
      expect(result.severity).toBe(expectedSeverity)
      expect(result.safe).toBe(expectedSafe)
    })
  })

  describe('sanitizeInput', () => {
    it.each([
      {
        name: 'remove script tags and inline handlers from text',
        input:
          '<div onclick="alert(1)">Click</div><script>alert(2)</script><a href="javascript:alert(3)">x</a>',
        type: 'text' as const,
        shouldExclude: ['<script', 'onclick', 'javascript:'],
      },
      {
        name: 'remove data html URIs from html',
        input: '<img src="data:text/html;base64,abc"><script>alert(1)</script>',
        type: 'html' as const,
        shouldExclude: ['data:text/html', '<script'],
      },
      {
        name: 'neutralize prototype pollution in json',
        input: '{"__proto__": {"polluted": true}, "note": "constructor[\\"prototype\\"]"}',
        type: 'json' as const,
        shouldInclude: ['_proto_'],
        shouldExclude: ['__proto__', 'constructor["prototype"]'],
      },
    ])('should $name', ({ input, type, shouldExclude = [], shouldInclude = [] }) => {
      const sanitized = securityScanner.sanitizeInput(input, type)
      shouldExclude.forEach(value => {
        expect(sanitized).not.toContain(value)
      })
      shouldInclude.forEach(value => {
        expect(sanitized).toContain(value)
      })
    })
  })

  describe('scanForVulnerabilities', () => {
    it.each([
      {
        name: 'auto-detects JSON and flags prototype pollution',
        code: '{"__proto__": {"polluted": true}}',
        expectedSeverity: 'critical',
      },
      {
        name: 'auto-detects Lua when function/end present',
        code: 'function dangerous() os.execute("rm -rf /") end',
        expectedSeverity: 'critical',
      },
      {
        name: 'auto-detects HTML and flags script tags',
        code: '<div><script>alert(1)</script></div>',
        expectedSeverity: 'critical',
      },
      {
        name: 'falls back to JavaScript scanning',
        code: 'const result = eval("1 + 1")',
        expectedSeverity: 'critical',
      },
      {
        name: 'honors explicit type parameter',
        code: 'return 1',
        type: 'lua' as const,
        expectedSeverity: 'safe',
      },
    ])('should $name', ({ code, type, expectedSeverity }) => {
      const result = scanForVulnerabilities(code, type)
      expect(result.severity).toBe(expectedSeverity)
    })
  })
})
