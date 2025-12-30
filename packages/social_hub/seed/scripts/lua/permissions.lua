---@alias UserRole "user" | "moderator" | "admin" | "god" | "supergod"

---@class SocialUser
---@field role? UserRole User role

---@class PermissionsModule
---@field can_post fun(user?: SocialUser): boolean Check if user can post
---@field can_moderate fun(user?: SocialUser): boolean Check if user can moderate
local Permissions = {}

---Check if user can create posts
---@param user? SocialUser User to check
---@return boolean
function Permissions.can_post(user)
  return user and (user.role == "user" or user.role == "moderator" or user.role == "admin" or user.role == "god" or user.role == "supergod")
end

---Check if user can moderate content
---@param user? SocialUser User to check
---@return boolean
function Permissions.can_moderate(user)
  return user and (user.role == "moderator" or user.role == "admin" or user.role == "god" or user.role == "supergod")
end

return Permissions
