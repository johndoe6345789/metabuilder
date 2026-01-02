-- Level 2 main content area

---@class UIComponent
---@field type string
---@field flex? number
---@field children? UIComponent[]

---@class MainLayoutComponent : UIComponent
---@field type "main"
---@field flex number
---@field children UIComponent[]

---Renders the main content area with flex layout
---@param children UIComponent[]?
---@return MainLayoutComponent
local function main(children)
  return {
    type = "main",
    flex = 1,
    children = children or {}
  }
end

return main
