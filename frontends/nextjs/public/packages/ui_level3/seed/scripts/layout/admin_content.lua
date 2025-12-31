---@class AdminContentComponent
---@field type string Component type identifier
---@field padding integer Padding size in pixels
---@field children table[] Child components to render

---Creates an admin content area wrapper component
---@param children table[]? Child components to display in content area
---@return AdminContentComponent Admin content component with children
local function admin_content(children)
  return {
    type = "admin_content",
    padding = 24,
    children = children or {}
  }
end

return admin_content
