import { toast } from 'sonner'
import type { Dispatch, SetStateAction } from 'react'
import type { LuaScript } from '@/lib/level-types'

const defaultCode = `-- Lua script example
-- Access input parameters via context.data
-- Use log() or print() to output messages

log("Script started")

if context.data then
  log("Received data:", context.data)
end

local result = {
  success = true,
  message = "Script executed successfully"
}

return result`

interface UpdateProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
  selectedScript: string | null
}

interface ScriptCrudProps extends UpdateProps {
  setSelectedScript: Dispatch<SetStateAction<string | null>>
}

export const createAddScript = ({ scripts, onScriptsChange, setSelectedScript }: ScriptCrudProps) => () => {
  const newScript: LuaScript = {
    id: `lua_${Date.now()}`,
    name: 'New Script',
    code: defaultCode,
    parameters: [],
  }
  onScriptsChange([...scripts, newScript])
  setSelectedScript(newScript.id)
  toast.success('Script created')
}

export const createDeleteScript = ({
  scripts,
  onScriptsChange,
  selectedScript,
  setSelectedScript,
}: ScriptCrudProps) => (scriptId: string) => {
  onScriptsChange(scripts.filter(script => script.id !== scriptId))
  if (selectedScript === scriptId) {
    setSelectedScript(scripts.length > 1 ? scripts[0]?.id ?? null : null)
  }
  toast.success('Script deleted')
}

export const createUpdateScript = ({ scripts, onScriptsChange, selectedScript }: UpdateProps) => (
  updates: Partial<LuaScript>
) => {
  if (!selectedScript) return
  onScriptsChange(
    scripts.map(script => (script.id === selectedScript ? { ...script, ...updates } : script))
  )
}
