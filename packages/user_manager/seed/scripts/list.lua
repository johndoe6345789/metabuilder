-- User list rendering
local M = {}

function M.columns()
  return {
    { id = "username", label = "Username", sortable = true },
    { id = "email", label = "Email", sortable = true },
    { id = "role", label = "Role", sortable = true },
    { id = "level", label = "Level", sortable = true },
    { id = "active", label = "Status", type = "badge" },
    { id = "actions", label = "", type = "actions" }
  }
end

function M.render_row(user)
  return {
    username = user.username,
    email = user.email,
    role = user.role,
    level = user.level,
    active = user.active and "Active" or "Inactive",
    actions = { "edit", "delete" }
  }
end

function M.render(users)
  local rows = {}
  for _, user in ipairs(users) do
    table.insert(rows, M.render_row(user))
  end
  return {
    type = "data_table",
    columns = M.columns(),
    rows = rows
  }
end

return M
