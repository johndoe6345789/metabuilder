local M = {}

function M.can_post(user)
  local role = user.role or "public"
  return role ~= "public"
end

function M.can_moderate(user)
  local role = user.role or "public"
  local allowed = {
    admin = true,
    god = true,
    supergod = true
  }
  return allowed[role] == true
end

return M
