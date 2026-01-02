--- Check if a user can moderate content
---@param user { role?: UserRole } User to check
---@return boolean Whether user can moderate
local function can_moderate(user)
  local role = user.role or "public"
  local allowed = {
    admin = true,
    god = true,
    supergod = true
  }
  return allowed[role] == true
end

return can_moderate
