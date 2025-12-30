-- User table module
--- @class UserTableModule User table configuration module
--- @field columns fun(): ColumnConfig[] Get column configurations
--- @field filters fun(): FilterConfig[] Get filter configurations
--- @field actions fun(): ActionConfig[] Get action configurations

--- @type UserTableModule
local table = {
  columns = require("table.columns"),
  filters = require("table.filters"),
  actions = require("table.actions")
}

return table
