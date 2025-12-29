import { useState } from 'react'
import { toast } from 'sonner'
import type { LuaScript } from '@/lib/level-types'

const createDefaultScript = (): LuaScript => ({
  id: `lua_${Date.now()}`,
  name: 'New Script',
  code: '-- Lua script example\n-- Access input parameters via context.data\n-- Use log() or print() to output messages\n\nlog("Script started")\n\nif context.data then\n  log("Received data:", context.data)\nend\n\nlocal result = {\n  success = true,\n  message = "Script executed successfully"\n}\n\nreturn result',
  parameters: [],
})

export const useLuaPersistence = (
  scripts: LuaScript[],
  onScriptsChange: (scripts: LuaScript[]) => void
) => {
  const [selectedScript, setSelectedScript] = useState<string | null>(
    scripts.length > 0 ? scripts[0].id : null
  )

  const currentScript = scripts.find(script => script.id === selectedScript) || null

  const handleAddScript = () => {
    const newScript = createDefaultScript()
    onScriptsChange([...scripts, newScript])
    setSelectedScript(newScript.id)
    toast.success('Script created')
  }

  const handleDeleteScript = (scriptId: string) => {
    onScriptsChange(scripts.filter(script => script.id !== scriptId))
    if (selectedScript === scriptId) {
      setSelectedScript(scripts.length > 1 ? scripts[0].id : null)
    }
    toast.success('Script deleted')
  }

  const handleUpdateScript = (updates: Partial<LuaScript>) => {
    if (!currentScript) return

    onScriptsChange(
      scripts.map(script => (script.id === selectedScript ? { ...script, ...updates } : script))
    )
  }

  const handleAddParameter = () => {
    if (!currentScript) return

    const newParam = { name: `param${currentScript.parameters.length + 1}`, type: 'string' }
    handleUpdateScript({ parameters: [...currentScript.parameters, newParam] })
  }

  const handleDeleteParameter = (index: number) => {
    if (!currentScript) return

    handleUpdateScript({
      parameters: currentScript.parameters.filter((_, i) => i !== index),
    })
  }

  const handleUpdateParameter = (index: number, updates: { name?: string; type?: string }) => {
    if (!currentScript) return

    handleUpdateScript({
      parameters: currentScript.parameters.map((param, i) =>
        i === index ? { ...param, ...updates } : param
      ),
    })
  }

  return {
    selectedScript,
    setSelectedScript,
    currentScript,
    handleAddScript,
    handleDeleteScript,
    handleUpdateScript,
    handleAddParameter,
    handleDeleteParameter,
    handleUpdateParameter,
  }
}
