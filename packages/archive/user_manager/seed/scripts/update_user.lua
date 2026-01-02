--- Update an existing user action
---@param user_id string User ID
---@param data table Update data
---@return UserAction Action object
local function update_user(user_id, data)
  return {
    action = "update_user",
    user_id = user_id,
    data = data
  }
end

return update_user
