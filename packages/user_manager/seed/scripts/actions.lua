-- User management actions
local M = {}

function M.create(data)
  return {
    action = "create_user",
    data = data
  }
end

function M.update(user_id, data)
  return {
    action = "update_user",
    user_id = user_id,
    data = data
  }
end

function M.delete(user_id)
  return {
    action = "delete_user",
    user_id = user_id,
    confirm = true
  }
end

function M.change_level(user_id, new_level)
  return {
    action = "change_level",
    user_id = user_id,
    level = new_level
  }
end

function M.toggle_active(user_id, active)
  return {
    action = "toggle_active",
    user_id = user_id,
    active = active
  }
end

return M
