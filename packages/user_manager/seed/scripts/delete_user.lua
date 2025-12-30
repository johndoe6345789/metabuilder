--- Delete a user action
---@param user_id string User ID
---@return UserAction Action object
local function delete_user(user_id)
  return {
    action = "delete_user",
    user_id = user_id,
    confirm = true
  }
end

return delete_user
