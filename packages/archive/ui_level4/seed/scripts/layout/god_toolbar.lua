-- Level 4 God panel toolbar component
-- Represents the toolbar area of the God panel with system status

---@class ToolbarAction
---@field id string
---@field label string
---@field icon string
---@field onClick string

---@class UIComponent
---@field type string
---@field actions ToolbarAction[]
---@field showSystemStatus boolean

---@param actions? ToolbarAction[]
---@return UIComponent
local function god_toolbar(actions)
  return {
    type = "god_toolbar",
    actions = actions or {},
    showSystemStatus = true
  }
end

return god_toolbar
