-- Supergod sidebar component

---@class SidebarComponent
---@field type string
---@field width string
---@field theme string
---@field items table[]

---Returns the supergod sidebar component configuration
---@param items? table[]
---@return SidebarComponent
local function supergod_sidebar(items)
  return {
    type = "supergod_sidebar",
    width = "320px",
    theme = "system",
    items = items or {}
  }
end

return supergod_sidebar
