--- Check if a user can create posts
---@param user { role?: UserRole } User to check
---@return boolean Whether user can post
local function can_post(user)
  local role = user.role or "public"
  return role ~= "public"
end

return can_post
