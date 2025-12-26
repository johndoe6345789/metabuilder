local M = {}

function M.can_publish(user)
  local role = user.role or "public"
  return role == "admin" or role == "god" or role == "supergod"
end

function M.can_moderate(user)
  local role = user.role or "public"
  return role == "admin" or role == "god" or role == "supergod"
end

return M
