import { toast } from 'sonner'
import { executeLuaScriptWithProfile } from '@/lib/lua/execute-lua-script-with-profile'
import type { LuaScript } from '@/lib/level-types'
import type { LuaExecutionResult } from '@/lib/lua-engine'
import { securityScanner } from '@/lib/security-scanner'

interface ScriptGetter {
  getCurrentScript: () => LuaScript | null
  getTestInputs: () => Record<string, any>
}

interface ExecutionState {
  setIsExecuting: (value: boolean) => void
  setTestOutput: (value: LuaExecutionResult | null) => void
  setSecurityScanResult: (result: any) => void
  setShowSecurityDialog: (value: boolean) => void
}

export const createTestScript = ({
  getCurrentScript,
  getTestInputs,
  setIsExecuting,
  setTestOutput,
  setSecurityScanResult,
  setShowSecurityDialog,
}: ScriptGetter & ExecutionState) => async () => {
  const currentScript = getCurrentScript()
  if (!currentScript) return

  const scanResult = securityScanner.scanLua(currentScript.code)
  setSecurityScanResult(scanResult)

  if (scanResult.severity === 'critical' || scanResult.severity === 'high') {
    setShowSecurityDialog(true)
    toast.warning('Security issues detected in script')
    return
  }

  if (scanResult.severity === 'medium' && scanResult.issues.length > 0) {
    toast.warning(`${scanResult.issues.length} security warning(s) detected`)
  }

  await executeScript({ currentScript, getTestInputs, setIsExecuting, setTestOutput })
}

export const createScanCode = ({
  getCurrentScript,
  setSecurityScanResult,
  setShowSecurityDialog,
}: Omit<ExecutionState, 'setIsExecuting' | 'setTestOutput'> & ScriptGetter) => () => {
  const currentScript = getCurrentScript()
  if (!currentScript) return

  const scanResult = securityScanner.scanLua(currentScript.code)
  setSecurityScanResult(scanResult)
  setShowSecurityDialog(true)

  if (scanResult.safe) {
    toast.success('No security issues detected')
  } else {
    toast.warning(`${scanResult.issues.length} security issue(s) detected`)
  }
}

export const createProceedExecution = ({
  getCurrentScript,
  getTestInputs,
  setIsExecuting,
  setTestOutput,
  setShowSecurityDialog,
}: ScriptGetter & Omit<ExecutionState, 'setSecurityScanResult'>) => () => {
  setShowSecurityDialog(false)
  const currentScript = getCurrentScript()
  if (!currentScript) return

  setTimeout(() => executeScript({ currentScript, getTestInputs, setIsExecuting, setTestOutput }), 100)
}

const executeScript = async ({
  currentScript,
  getTestInputs,
  setIsExecuting,
  setTestOutput,
}: {
  currentScript: LuaScript
  getTestInputs: () => Record<string, any>
  setIsExecuting: (value: boolean) => void
  setTestOutput: (value: LuaExecutionResult | null) => void
}) => {
  setIsExecuting(true)
  setTestOutput(null)

  try {
    const contextData: Record<string, any> = {}
    currentScript.parameters.forEach(param => {
      contextData[param.name] = getTestInputs()[param.name]
    })

    const result = await executeLuaScriptWithProfile(
      currentScript.code,
      {
        data: contextData,
        user: { username: 'test_user', role: 'god' },
        log: (...args: any[]) => console.log('[Lua]', ...args),
      },
      currentScript
    )

    setTestOutput(result)
    toast[result.success ? 'success' : 'error'](
      result.success ? 'Script executed successfully' : 'Script execution failed'
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    toast.error(`Execution error: ${message}`)
    setTestOutput({ success: false, error: message, logs: [] })
  } finally {
    setIsExecuting(false)
  }
}
