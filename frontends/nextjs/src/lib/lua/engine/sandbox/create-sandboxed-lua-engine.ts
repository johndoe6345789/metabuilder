import { SandboxedLuaEngine } from './sandboxed-lua-engine'

/**
 * Factory function to create a new SandboxedLuaEngine instance
 * @param timeout - Execution timeout in milliseconds
 * @returns New SandboxedLuaEngine instance
 */
export function createSandboxedLuaEngine(timeout: number = 5000): SandboxedLuaEngine {
  return new SandboxedLuaEngine(timeout)
}
