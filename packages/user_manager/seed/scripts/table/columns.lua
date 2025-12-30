-- User table columns
local function user_columns()
  return {
    { id = "avatar", type = "image", width = "50px" },
    { id = "name", type = "text", sortable = true },
    { id = "email", type = "text", sortable = true },
    { id = "role", type = "badge" },
    { id = "actions", type = "actions" }
  }
end

return user_columns
