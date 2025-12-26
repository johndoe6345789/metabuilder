import type { SandboxedLuaEngineState } from './types'

export function enforceMaxMemory(this: SandboxedLuaEngineState): void {
  if (!Number.isFinite(this.maxMemory) || this.maxMemory <= 0) return

  const usageBytes = this.getLuaMemoryUsageBytes()
  if (usageBytes > this.maxMemory) {
    throw new Error(
      `Memory limit exceeded: ${usageBytes} bytes used (max ${this.maxMemory})`
    )
  }
}
