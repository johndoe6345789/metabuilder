---@alias StreamUserRole "public" | "user" | "moderator" | "admin" | "god" | "supergod"

---@class StreamUser
---@field role? StreamUserRole User role

---@class StreamPermissionsModule
---@field can_publish fun(user: StreamUser): boolean Check if user can publish streams
---@field can_moderate fun(user: StreamUser): boolean Check if user can moderate streams
local M = {}

---Check if user can publish streams
---@param user StreamUser User to check
---@return boolean
function M.can_publish(user)
  local role = user.role or "public"
  return role == "moderator" or role == "admin" or role == "god" or role == "supergod"
end

---Check if user can moderate streams
---@param user StreamUser User to check
---@return boolean
function M.can_moderate(user)
  local role = user.role or "public"
  return role == "moderator" or role == "admin" or role == "god" or role == "supergod"
end

return M
