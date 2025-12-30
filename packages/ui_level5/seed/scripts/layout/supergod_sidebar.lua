-- Level 5 Supergod panel sidebar

---@class SidebarComponent
---@field type string
---@field width string
---@field theme string
---@field items table[]

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
