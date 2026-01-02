-- Column definitions module

---@class ColumnDefinitions
---@field text fun(id: string, label: string, width?: string): TextColumn
---@field number fun(id: string, label: string, width?: string): NumberColumn
---@field date fun(id: string, label: string, format?: string): DateColumn
---@field action fun(id: string, actions?: Action[]): ActionColumn
local columns = {
  text = require("columns.text"),
  number = require("columns.number"),
  date = require("columns.date"),
  action = require("columns.action")
}

return columns
