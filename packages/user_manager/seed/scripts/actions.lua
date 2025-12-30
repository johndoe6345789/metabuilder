-- User management actions

---@class UserAction
---@field action string
---@field user_id string?
---@field data table?
---@field confirm boolean?
---@field level number?
---@field active boolean?

local M = {}

---Create a new user
---@param data table
---@return UserAction
function M.create(data)
  return {
    action = "create_user",
    data = data
  }
end

---Update an existing user
---@param user_id string
---@param data table
---@return UserAction
function M.update(user_id, data)
  return {
    action = "update_user",
    user_id = user_id,
    data = data
  }
end

---Delete a user
---@param user_id string
---@return UserAction
function M.delete(user_id)
  return {
    action = "delete_user",
    user_id = user_id,
    confirm = true
  }
end

---Change user access level
---@param user_id string
---@param new_level number
---@return UserAction
function M.change_level(user_id, new_level)
  return {
    action = "change_level",
    user_id = user_id,
    level = new_level
  }
end

---Toggle user active status
---@param user_id string
---@param active boolean
---@return UserAction
function M.toggle_active(user_id, active)
  return {
    action = "toggle_active",
    user_id = user_id,
    active = active
  }
end

return M
