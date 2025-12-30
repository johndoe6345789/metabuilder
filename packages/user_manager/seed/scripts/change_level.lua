--- Change user access level action
---@param user_id string User ID
---@param new_level number New access level (1-6)
---@return UserAction Action object
local function change_level(user_id, new_level)
  return {
    action = "change_level",
    user_id = user_id,
    level = new_level
  }
end

return change_level
