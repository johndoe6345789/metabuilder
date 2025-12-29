local M = {}

function M.render(ctx)
  local rows = {}
  for _, u in ipairs(ctx.users or {}) do
    rows[#rows + 1] = {
      type = "TableRow",
      children = {
        { type = "TableCell", props = { text = u.username } },
        { type = "TableCell", props = { text = u.email or "-" } },
        { type = "TableCell", props = { text = u.role } },
        { type = "TableCell", children = {
          { type = "Button", props = { size = "sm", text = "Edit", onClick = "editUser", data = u.id } },
          { type = "Button", props = { size = "sm", variant = "destructive", text = "Delete", onClick = "deleteUser", data = u.id } }
        }}
      }
    }
  end
  return {
    type = "Table",
    children = {
      { type = "TableHeader", children = {
        { type = "TableRow", children = {
          { type = "TableHead", props = { text = "Username" } },
          { type = "TableHead", props = { text = "Email" } },
          { type = "TableHead", props = { text = "Role" } },
          { type = "TableHead", props = { text = "Actions" } }
        }}
      }},
      { type = "TableBody", children = rows }
    }
  }
end

return M
