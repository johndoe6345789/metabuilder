--- Create a new user action
---@param data table User data
---@return UserAction Action object
local function create_user(data)
  return {
    action = "create_user",
    data = data
  }
end

return create_user
