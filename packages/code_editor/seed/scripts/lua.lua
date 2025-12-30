-- Lua Editor utilities

---@class LuaEditor
local M = {}

---@class EditorOptions
---@field read_only? boolean

---@class UIComponent
---@field type string
---@field props? table
---@field children? table

---@class ValidationResult
---@field valid boolean
---@field errors table

---@class SandboxAction
---@field action string
---@field sandbox boolean
---@field context table

---@param value? string
---@param options? EditorOptions
---@return UIComponent
function M.render(value, options)
  return {
    type = "code_editor",
    props = {
      language = "lua",
      value = value or "",
      read_only = options and options.read_only or false,
      line_numbers = true,
      show_snippets = true
    }
  }
end

---@param lua_code string
---@return ValidationResult
function M.validate(lua_code)
  -- Lua syntax validation placeholder
  return {
    valid = true,
    errors = {}
  }
end

---@param lua_code string
---@param context? table
---@return SandboxAction
function M.run_sandbox(lua_code, context)
  return {
    action = "execute",
    sandbox = true,
    context = context or {}
  }
end

return M
