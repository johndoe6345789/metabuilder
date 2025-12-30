-- Level 5 Supergod panel toolbar

---@class ToolbarComponent
---@field type string
---@field actions table[]
---@field showAllTenants boolean
---@field showSystemMetrics boolean

---@param actions? table[]
---@return ToolbarComponent
local function supergod_toolbar(actions)
  return {
    type = "supergod_toolbar",
    actions = actions or {},
    showAllTenants = true,
    showSystemMetrics = true
  }
end

return supergod_toolbar
