-- Supergod content component

---@class ContentComponent
---@field type string
---@field fullWidth boolean
---@field multiTenant boolean
---@field children table[]

---Returns the supergod content component configuration
---@param children? table[]
---@return ContentComponent
local function supergod_content(children)
  return {
    type = "supergod_content",
    fullWidth = true,
    multiTenant = true,
    children = children or {}
  }
end

return supergod_content
