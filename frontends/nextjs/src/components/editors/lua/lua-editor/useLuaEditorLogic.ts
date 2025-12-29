import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { executeLuaScriptWithProfile } from '@/lib/lua/execute-lua-script-with-profile'
import type { LuaExecutionResult } from '@/lib/lua-engine'
import type { LuaScript } from '@/lib/level-types'
import { securityScanner, type SecurityScanResult } from '@/lib/security-scanner'

interface UseLuaEditorLogicProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
}

const defaultCode =
  '-- Lua script example\n-- Access input parameters via context.data\n-- Use log() or print() to output messages\n\nlog("Script started")\n\nif context.data then\n  log("Received data:", context.data)\nend\n\nlocal result = {\n  success = true,\n  message = "Script executed successfully"\n}\n\nreturn result'

export const useLuaEditorLogic = ({ scripts, onScriptsChange }: UseLuaEditorLogicProps) => {
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(
    scripts.length > 0 ? scripts[0].id : null
  )
  const [testOutput, setTestOutput] = useState<LuaExecutionResult | null>(null)
  const [testInputs, setTestInputs] = useState<Record<string, any>>({})
  const [isExecuting, setIsExecuting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSnippetLibrary, setShowSnippetLibrary] = useState(false)
  const [securityScanResult, setSecurityScanResult] = useState<SecurityScanResult | null>(null)
  const [showSecurityDialog, setShowSecurityDialog] = useState(false)

  const currentScript = useMemo(
    () => scripts.find(script => script.id === selectedScriptId),
    [scripts, selectedScriptId]
  )

  useEffect(() => {
    if (scripts.length > 0 && !selectedScriptId) setSelectedScriptId(scripts[0].id)
  }, [scripts, selectedScriptId])

  useEffect(() => {
    if (!currentScript) return
    const inputs: Record<string, any> = {}
    currentScript.parameters.forEach(param => {
      inputs[param.name] = param.type === 'number' ? 0 : param.type === 'boolean' ? false : ''
    })
    setTestInputs(inputs)
  }, [currentScript?.parameters.length, selectedScriptId])

  const handleAddScript = () => {
    const newScript: LuaScript = {
      id: `lua_${Date.now()}`,
      name: 'New Script',
      code: defaultCode,
      parameters: [],
    }
    onScriptsChange([...scripts, newScript])
    setSelectedScriptId(newScript.id)
    toast.success('Script created')
  }

  const handleDeleteScript = (scriptId: string) => {
    onScriptsChange(scripts.filter(s => s.id !== scriptId))
    if (selectedScriptId === scriptId)
      setSelectedScriptId(scripts.length > 1 ? scripts[0].id : null)
    toast.success('Script deleted')
  }

  const handleUpdateScript = (updates: Partial<LuaScript>) => {
    if (!currentScript) return
    onScriptsChange(
      scripts.map(script => (script.id === currentScript.id ? { ...script, ...updates } : script))
    )
  }

  const handleAddParameter = () =>
    currentScript &&
    handleUpdateScript({
      parameters: [
        ...currentScript.parameters,
        { name: `param${currentScript.parameters.length + 1}`, type: 'string' },
      ],
    })
  const handleDeleteParameter = (index: number) =>
    currentScript &&
    handleUpdateScript({ parameters: currentScript.parameters.filter((_, i) => i !== index) })
  const handleUpdateParameter = (index: number, updates: { name?: string; type?: string }) =>
    currentScript &&
    handleUpdateScript({
      parameters: currentScript.parameters.map((p, i) => (i === index ? { ...p, ...updates } : p)),
    })
  const handleTestInputChange = (paramName: string, value: any) =>
    setTestInputs({ ...testInputs, [paramName]: value })

  const executeScript = async () => {
    if (!currentScript) return
    setIsExecuting(true)
    setTestOutput(null)
    try {
      const contextData: any = {}
      currentScript.parameters.forEach(param => {
        contextData[param.name] = testInputs[param.name]
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
      toast.error('Execution error: ' + message)
      setTestOutput({ success: false, error: message, logs: [] })
    } finally {
      setIsExecuting(false)
    }
  }

  const runSecurityScan = () => {
    if (!currentScript) return null
    const scanResult = securityScanner.scanLua(currentScript.code)
    setSecurityScanResult(scanResult)
    return scanResult
  }

  const handleTestScript = async () => {
    if (!currentScript) return
    const scanResult = runSecurityScan()
    if (!scanResult) return
    if (scanResult.severity === 'critical' || scanResult.severity === 'high') {
      setShowSecurityDialog(true)
      toast.warning('Security issues detected in script')
      return
    }
    if (scanResult.severity === 'medium' && scanResult.issues.length > 0) {
      toast.warning(`${scanResult.issues.length} security warning(s) detected`)
    }
    await executeScript()
  }

  const handleScanCode = () => {
    const scanResult = runSecurityScan()
    if (!scanResult) return
    setShowSecurityDialog(true)
    if (scanResult.safe) toast.success('No security issues detected')
    else toast.warning(`${scanResult.issues.length} security issue(s) detected`)
  }

  const handleProceedWithExecution = async () => {
    setShowSecurityDialog(false)
    await executeScript()
  }

  return {
    currentScript,
    selectedScriptId,
    testOutput,
    testInputs,
    isExecuting,
    isFullscreen,
    showSnippetLibrary,
    securityScanResult,
    showSecurityDialog,
    setSelectedScriptId,
    setIsFullscreen,
    setShowSnippetLibrary,
    setShowSecurityDialog,
    handleAddScript,
    handleDeleteScript,
    handleUpdateScript,
    handleAddParameter,
    handleDeleteParameter,
    handleUpdateParameter,
    handleTestInputChange,
    handleScanCode,
    handleTestScript,
    handleProceedWithExecution,
  }
}
