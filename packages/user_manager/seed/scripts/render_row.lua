--- Render a single user row
---@param user User User object
---@return TableRow Table row data
local function render_row(user)
  return {
    username = user.username,
    email = user.email,
    role = user.role,
    level = user.level,
    active = user.active and "Active" or "Inactive",
    actions = { "edit", "delete" }
  }
end

return render_row
