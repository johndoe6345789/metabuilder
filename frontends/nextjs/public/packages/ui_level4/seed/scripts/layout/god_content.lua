-- Level 4 God panel content component
-- Represents the main content area of the God panel layout

---@class UIComponent
---@field type string
---@field fullWidth boolean
---@field children? UIComponent[]

---@param children? UIComponent[]
---@return UIComponent
local function god_content(children)
  return {
    type = "god_content",
    fullWidth = true,
    children = children or {}
  }
end

return god_content
