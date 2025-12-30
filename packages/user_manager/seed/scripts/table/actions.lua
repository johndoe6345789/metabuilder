-- User table actions
local function user_actions()
  return {
    { id = "edit", icon = "edit", label = "Edit" },
    { id = "delete", icon = "trash", label = "Delete", confirm = true },
    { id = "impersonate", icon = "user", label = "Impersonate" }
  }
end

return user_actions
