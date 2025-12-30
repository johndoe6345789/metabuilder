-- Level 2 layout module

---@class LayoutModule
---@field sidebar fun(items: UIComponent[]): UIComponent
---@field main fun(children: UIComponent[]): UIComponent

---@type LayoutModule
local layout = {
  sidebar = require("layout.sidebar"),
  main = require("layout.main")
}

return layout
