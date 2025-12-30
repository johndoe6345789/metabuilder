-- Code editor toolbar

---@class ToolbarConfig
---@field type string
---@field actions string[]

---@param actions? string[]
---@return ToolbarConfig
local function toolbar(actions)
  return {
    type = "editor_toolbar",
    actions = actions or { "save", "undo", "redo", "format" }
  }
end

return toolbar
