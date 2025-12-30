-- Dashboard layout module

---@class LayoutModule
---@field grid fun(columns: number?, rows: number?, gap: number?): LayoutConfig
---@field flex fun(direction: string?, gap: number?, align: string?): LayoutConfig
---@field section fun(title: string, children: table?): LayoutConfig

---@type LayoutModule
local layout = {
  grid = require("layout.grid"),
  flex = require("layout.flex"),
  section = require("layout.section")
}

return layout
