import type { LuaScript } from '@/lib/level-types'

import type { LuaBlock } from '../../types'

export const selectSelectedScript = (
  scripts: LuaScript[],
  selectedScriptId: string | null
): LuaScript | null => scripts.find(script => script.id === selectedScriptId) || null

export const selectActiveBlocks = (
  blocksByScript: Record<string, LuaBlock[]>,
  selectedScriptId: string | null
): LuaBlock[] => (selectedScriptId ? blocksByScript[selectedScriptId] || [] : [])
