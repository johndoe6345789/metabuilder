// Type declarations for fengari-web

declare module 'fengari-web' {
  export interface lua_State {}
  
  export const lua: {
    LUA_OK: number
    LUA_TNIL: number
    LUA_TBOOLEAN: number
    LUA_TNUMBER: number
    LUA_TSTRING: number
    LUA_TTABLE: number
    LUA_TFUNCTION: number
    
    lua_pushnil(L: lua_State): void
    lua_pushboolean(L: lua_State, b: number): void
    lua_pushnumber(L: lua_State, n: number): void
    lua_pushstring(L: lua_State, s: Uint8Array): void
    lua_pushcfunction(L: lua_State, fn: (L: lua_State) => number): void
    
    lua_createtable(L: lua_State, narr: number, nrec: number): void
    lua_rawseti(L: lua_State, index: number, i: number): void
    lua_rawset(L: lua_State, index: number): void
    lua_setglobal(L: lua_State, name: Uint8Array): void
    lua_getfield(L: lua_State, index: number, name: Uint8Array): void
    
    lua_type(L: lua_State, index: number): number
    lua_gettop(L: lua_State): number
    lua_toboolean(L: lua_State, index: number): number
    lua_tonumber(L: lua_State, index: number): number
    lua_tostring(L: lua_State, index: number): Uint8Array
    lua_isfunction(L: lua_State, index: number): boolean
    
    lua_pop(L: lua_State, n: number): void
    lua_pcall(L: lua_State, nargs: number, nresults: number, msgh: number): number
    lua_next(L: lua_State, index: number): number
    lua_close(L: lua_State): void
  }
  
  export const lauxlib: {
    luaL_newstate(): lua_State
    luaL_loadstring(L: lua_State, s: Uint8Array): number
  }
  
  export const lualib: {
    luaL_openlibs(L: lua_State): void
  }
  
  export function to_luastring(s: string): Uint8Array
  export function to_jsstring(s: Uint8Array): string
}
