local get_columns = require("get_columns")
local render_row = require("render_row")

--- Render users list as data table config
---@param users User[] Array of users
---@return DataTableConfig Table configuration
local function render_users(users)
  local rows = {}
  for _, user in ipairs(users) do
    table.insert(rows, render_row(user))
  end
  return {
    type = "data_table",
    columns = get_columns(),
    rows = rows
  }
end

return render_users
