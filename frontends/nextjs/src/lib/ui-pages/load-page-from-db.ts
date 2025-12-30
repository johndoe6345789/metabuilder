import { Database } from '@/lib/database'
import { createLuaEngine } from '@/lib/lua/engine/core/create-lua-engine'
import { executeLuaCode } from '@/lib/lua/functions/execution/execute-lua-code'
import { normalizeLuaStructure } from '@/lib/lua/ui/normalize-lua-structure'
import type { UIPageRecord } from '@/lib/seed/import-ui-pages'
import type { JsonObject, JsonValue } from '@/types/utility-types'

export type LuaActionHandler = (payload?: JsonObject) => Promise<JsonValue | null>

/**
 * Load a UI page from database and optionally process with Lua
 * Flow: Database → Lua (optional runtime transforms) → Normalized JSON → React
 */
export async function loadPageFromDB(path: string): Promise<UIPageData | null> {
  // 1. Fetch page from database
  const pages = await Database.query<UIPageRecord>(
    'SELECT * FROM ui_page WHERE path = ? AND is_active = TRUE LIMIT 1',
    [path]
  )

  if (pages.length === 0) {
    return null
  }

  const page = pages[0]

  // 2. Get associated Lua scripts if any (from actions field)
  let processedLayout: JsonValue = page.layout
  const actionHandlers: Record<string, LuaActionHandler> = {}

  if (page.actions) {
    // Load Lua action handlers
    const actions = page.actions as Record<string, string>

    for (const [actionName, luaCode] of Object.entries(actions)) {
      if (typeof luaCode === 'string') {
        // Wrap Lua code in a JavaScript function
        actionHandlers[actionName] = createLuaActionHandler(luaCode, actionName)
      }
    }
  }

  // 3. Optional: Process layout with Lua transforms
  // If there's a layout_transformer Lua script, execute it
  const layoutTransformer = await Database.query(
    `SELECT code FROM lua_script
     WHERE name = ? AND category = 'ui_transform'
     LIMIT 1`,
    [`${page.path}_transformer`]
  )

  if (layoutTransformer.length > 0) {
    const engine = createLuaEngine()
    const result = await executeLuaCode(
      engine.L,
      layoutTransformer[0].code,
      { data: processedLayout },
      []
    )

    if (result.success && result.result) {
      processedLayout = normalizeLuaStructure(result.result) as JsonObject
    }

    engine.destroy()
  }

  // 4. Normalize and return
  return {
    path: page.path,
    title: page.title,
    level: page.level,
    requireAuth: page.require_auth,
    requiredRole: page.required_role || undefined,
    layout: normalizeLuaStructure(processedLayout) as JsonObject,
    actions: actionHandlers,
  }
}

/**
 * Create a JavaScript wrapper for a Lua action handler
 */
function createLuaActionHandler(luaCode: string, actionName: string): LuaActionHandler {
  return async (payload: JsonObject = {}) => {
    const engine = createLuaEngine()

    try {
      const result = await executeLuaCode(
        engine.L,
        luaCode,
        { data: payload },
        []
      )

      if (!result.success) {
        console.error(`Lua action ${actionName} failed:`, result.error)
        throw new Error(result.error)
      }

      return (result.result ?? null) as JsonValue | null
    } finally {
      engine.destroy()
    }
  }
}

/**
 * UI Page data structure for rendering
 */
export interface UIPageData {
  path: string
  title: string
  level: number
  requireAuth: boolean
  requiredRole?: string
  layout: JsonObject
  actions: Record<string, LuaActionHandler>
}
