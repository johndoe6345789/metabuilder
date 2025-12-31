-- Level 5 Supergod panel content

---@class UIComponent
---@field type string
---@field fullWidth? boolean
---@field multiTenant? boolean
---@field children? table[]

---@param children? table[]
---@return UIComponent
local function supergod_content(children)
  return {
    type = "supergod_content",
    fullWidth = true,
    multiTenant = true,
    children = children or {}
  }
end

return supergod_content
