/**
 * Lua Security Patterns
 * Patterns for detecting malicious Lua code
 */

import type { SecurityPattern } from '../types'

export const LUA_PATTERNS: SecurityPattern[] = [
  {
    pattern: /os\.(execute|exit|remove|rename|tmpname)/gi,
    type: 'malicious',
    severity: 'critical',
    message: 'Lua OS module system call detected',
    recommendation: 'OS module access is disabled for security'
  },
  {
    pattern: /io\.(popen|tmpfile|open|input|output|lines)/gi,
    type: 'malicious',
    severity: 'critical',
    message: 'Lua file I/O operation detected',
    recommendation: 'File system access is disabled for security'
  },
  {
    pattern: /loadfile|dofile/gi,
    type: 'dangerous',
    severity: 'critical',
    message: 'Lua file loading function detected',
    recommendation: 'File loading is disabled for security'
  },
  {
    pattern: /package\.(loadlib|searchpath|cpath)/gi,
    type: 'dangerous',
    severity: 'critical',
    message: 'Lua dynamic library loading detected',
    recommendation: 'Dynamic library loading is disabled'
  },
  {
    pattern: /debug\.(getinfo|setmetatable|getfenv|setfenv)/gi,
    type: 'dangerous',
    severity: 'high',
    message: 'Lua debug module advanced features detected',
    recommendation: 'Limited debug functionality available'
  },
  {
    pattern: /loadstring\s*\(/gi,
    type: 'dangerous',
    severity: 'high',
    message: 'Lua dynamic code execution detected',
    recommendation: 'Use with extreme caution'
  },
  {
    pattern: /\.\.\s*[[\]]/gi,
    type: 'suspicious',
    severity: 'medium',
    message: 'Potential Lua table manipulation',
    recommendation: 'Ensure proper validation'
  },
  {
    pattern: /_G\s*\[/gi,
    type: 'suspicious',
    severity: 'high',
    message: 'Global environment manipulation detected',
    recommendation: 'Avoid modifying global environment'
  },
  {
    pattern: /getmetatable|setmetatable/gi,
    type: 'suspicious',
    severity: 'medium',
    message: 'Metatable manipulation detected',
    recommendation: 'Use carefully to avoid security issues'
  },
  {
    pattern: /while\s+true\s+do/gi,
    type: 'warning',
    severity: 'medium',
    message: 'Infinite loop detected',
    recommendation: 'Ensure proper break conditions exist'
  },
  {
    pattern: /function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\1\s*\(/gi,
    type: 'warning',
    severity: 'low',
    message: 'Potential recursive function',
    recommendation: 'Ensure recursion has proper termination'
  }
]
