--- Toggle user active status action
---@param user_id string User ID
---@param active boolean New active status
---@return UserAction Action object
local function toggle_active(user_id, active)
  return {
    action = "toggle_active",
    user_id = user_id,
    active = active
  }
end

return toggle_active
