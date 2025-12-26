import { LuaEngine } from './LuaEngine'

/**
 * Factory function to create a new LuaEngine instance
 * @returns New LuaEngine instance
 */
export const createLuaEngine = (): LuaEngine => {
  return new LuaEngine()
}
