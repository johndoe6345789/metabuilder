--- Get user table column definitions
---@return TableColumn[] Column definitions
local function get_columns()
  return {
    { id = "username", label = "Username", sortable = true },
    { id = "email", label = "Email", sortable = true },
    { id = "role", label = "Role", sortable = true },
    { id = "level", label = "Level", sortable = true },
    { id = "active", label = "Status", type = "badge" },
    { id = "actions", label = "", type = "actions" }
  }
end

return get_columns
