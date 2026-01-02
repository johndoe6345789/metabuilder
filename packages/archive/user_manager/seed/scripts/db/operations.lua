-- user_manager/seed/scripts/db/operations.lua
-- DBAL operations for User management
-- Uses existing User entity from Prisma schema
-- @module user_manager.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- USER CRUD OPERATIONS
---------------------------------------------------------------------------

---@class UserCreateParams
---@field tenantId string
---@field email string
---@field username string
---@field password string Hashed password
---@field displayName string|nil
---@field avatar string|nil
---@field level number 0-6 permission level
---@field status string active|inactive|banned

---Create a new user
---@param dbal table DBAL client instance
---@param params UserCreateParams
---@return table Created user
function M.createUser(dbal, params)
  return dbal:create('User', {
    tenantId = params.tenantId,
    email = params.email,
    username = params.username,
    password = params.password,
    displayName = params.displayName or params.username,
    avatar = params.avatar,
    level = params.level or 1,
    status = params.status or 'active',
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get user by ID
---@param dbal table
---@param userId string
---@return table|nil User
function M.getUser(dbal, userId)
  return dbal:read('User', userId)
end

---Get user by email
---@param dbal table
---@param tenantId string
---@param email string
---@return table|nil User
function M.getUserByEmail(dbal, tenantId, email)
  return dbal:findFirst('User', {
    where = { tenantId = tenantId, email = email },
  })
end

---Get user by username
---@param dbal table
---@param tenantId string
---@param username string
---@return table|nil User
function M.getUserByUsername(dbal, tenantId, username)
  return dbal:findFirst('User', {
    where = { tenantId = tenantId, username = username },
  })
end

---List users
---@param dbal table
---@param tenantId string
---@param status string|nil Filter by status
---@param minLevel number|nil Minimum permission level
---@param take number|nil
---@param skip number|nil
---@return table List result
function M.listUsers(dbal, tenantId, status, minLevel, take, skip)
  local where = { tenantId = tenantId }
  
  if status then
    where.status = status
  end
  
  local result = dbal:list('User', {
    where = where,
    orderBy = { createdAt = 'desc' },
    take = take or 50,
    skip = skip or 0,
  })
  
  -- Filter by minLevel if specified
  if minLevel and result.items then
    local filtered = {}
    for _, user in ipairs(result.items) do
      if (user.level or 0) >= minLevel then
        table.insert(filtered, user)
      end
    end
    result.items = filtered
  end
  
  return result
end

---Update user
---@param dbal table
---@param userId string
---@param updates table
---@return table Updated user
function M.updateUser(dbal, userId, updates)
  updates.updatedAt = os.time() * 1000
  return dbal:update('User', userId, updates)
end

---Update user profile
---@param dbal table
---@param userId string
---@param displayName string|nil
---@param avatar string|nil
---@param bio string|nil
---@return table Updated user
function M.updateProfile(dbal, userId, displayName, avatar, bio)
  local updates = { updatedAt = os.time() * 1000 }
  
  if displayName ~= nil then
    updates.displayName = displayName
  end
  if avatar ~= nil then
    updates.avatar = avatar
  end
  if bio ~= nil then
    updates.bio = bio
  end
  
  return dbal:update('User', userId, updates)
end

---Change user password
---@param dbal table
---@param userId string
---@param hashedPassword string
---@return table Updated user
function M.changePassword(dbal, userId, hashedPassword)
  return M.updateUser(dbal, userId, {
    password = hashedPassword,
  })
end

---Set user status
---@param dbal table
---@param userId string
---@param status string active|inactive|banned
---@return table Updated user
function M.setStatus(dbal, userId, status)
  return M.updateUser(dbal, userId, { status = status })
end

---Activate user
---@param dbal table
---@param userId string
function M.activateUser(dbal, userId)
  return M.setStatus(dbal, userId, 'active')
end

---Deactivate user
---@param dbal table
---@param userId string
function M.deactivateUser(dbal, userId)
  return M.setStatus(dbal, userId, 'inactive')
end

---Ban user
---@param dbal table
---@param userId string
---@param reason string|nil
function M.banUser(dbal, userId, reason)
  return M.updateUser(dbal, userId, {
    status = 'banned',
    banReason = reason,
    bannedAt = os.time() * 1000,
  })
end

---Unban user
---@param dbal table
---@param userId string
function M.unbanUser(dbal, userId)
  return M.updateUser(dbal, userId, {
    status = 'active',
    banReason = nil,
    bannedAt = nil,
  })
end

---------------------------------------------------------------------------
-- PERMISSION OPERATIONS
---------------------------------------------------------------------------

---Set user permission level
---@param dbal table
---@param userId string
---@param level number 0-6
---@return table Updated user
function M.setLevel(dbal, userId, level)
  if level < 0 or level > 6 then
    error('Invalid permission level: ' .. tostring(level))
  end
  return M.updateUser(dbal, userId, { level = level })
end

---Promote user by one level
---@param dbal table
---@param userId string
---@param maxLevel number|nil Maximum level to promote to
---@return table Updated user
function M.promoteUser(dbal, userId, maxLevel)
  local user = M.getUser(dbal, userId)
  if not user then
    error('User not found: ' .. userId)
  end
  
  local newLevel = math.min((user.level or 0) + 1, maxLevel or 6)
  return M.setLevel(dbal, userId, newLevel)
end

---Demote user by one level
---@param dbal table
---@param userId string
---@return table Updated user
function M.demoteUser(dbal, userId)
  local user = M.getUser(dbal, userId)
  if not user then
    error('User not found: ' .. userId)
  end
  
  local newLevel = math.max((user.level or 0) - 1, 0)
  return M.setLevel(dbal, userId, newLevel)
end

---Check if user has minimum permission level
---@param dbal table
---@param userId string
---@param requiredLevel number
---@return boolean
function M.hasPermission(dbal, userId, requiredLevel)
  local user = M.getUser(dbal, userId)
  if not user then
    return false
  end
  return (user.level or 0) >= requiredLevel
end

---------------------------------------------------------------------------
-- BULK OPERATIONS
---------------------------------------------------------------------------

---List admins (level >= 3)
---@param dbal table
---@param tenantId string
---@return table[] Admin users
function M.listAdmins(dbal, tenantId)
  local result = M.listUsers(dbal, tenantId, 'active', 3, 100, 0)
  return result.items or {}
end

---List moderators (level >= 2)
---@param dbal table
---@param tenantId string
---@return table[] Moderator users
function M.listModerators(dbal, tenantId)
  local result = M.listUsers(dbal, tenantId, 'active', 2, 100, 0)
  return result.items or {}
end

---Count users by status
---@param dbal table
---@param tenantId string
---@return table Counts by status
function M.countByStatus(dbal, tenantId)
  local all = M.listUsers(dbal, tenantId, nil, nil, 10000, 0)
  
  local counts = {
    active = 0,
    inactive = 0,
    banned = 0,
    total = 0,
  }
  
  for _, user in ipairs(all.items or {}) do
    counts.total = counts.total + 1
    local status = user.status or 'active'
    counts[status] = (counts[status] or 0) + 1
  end
  
  return counts
end

---Search users by username or email
---@param dbal table
---@param tenantId string
---@param query string
---@param take number|nil
---@return table[] Matching users
function M.searchUsers(dbal, tenantId, query, take)
  local all = M.listUsers(dbal, tenantId, nil, nil, 1000, 0)
  local matches = {}
  local lowerQuery = query:lower()
  
  for _, user in ipairs(all.items or {}) do
    local username = (user.username or ''):lower()
    local email = (user.email or ''):lower()
    local displayName = (user.displayName or ''):lower()
    
    if username:find(lowerQuery, 1, true) or
       email:find(lowerQuery, 1, true) or
       displayName:find(lowerQuery, 1, true) then
      table.insert(matches, user)
      if #matches >= (take or 20) then
        break
      end
    end
  end
  
  return matches
end

---Delete user
---@param dbal table
---@param userId string
---@return boolean Success
function M.deleteUser(dbal, userId)
  return dbal:delete('User', userId)
end

return M
