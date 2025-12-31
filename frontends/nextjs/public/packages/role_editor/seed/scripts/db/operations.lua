-- role_editor/seed/scripts/db/operations.lua
-- DBAL operations for Role management
-- Uses Permission entity from Prisma schema
-- @module role_editor.db.operations

local M = {}
local json = require('json')

-- Permission levels
M.LEVELS = {
  PUBLIC = 0,
  USER = 1,
  MODERATOR = 2,
  ADMIN = 3,
  GOD = 4,
  SUPERGOD = 5,
  SYSTEM = 6,
}

M.LEVEL_NAMES = {
  [0] = 'Public',
  [1] = 'User',
  [2] = 'Moderator',
  [3] = 'Admin',
  [4] = 'God',
  [5] = 'Supergod',
  [6] = 'System',
}

---------------------------------------------------------------------------
-- ROLE/PERMISSION OPERATIONS
---------------------------------------------------------------------------

---@class RoleCreateParams
---@field tenantId string
---@field name string
---@field level number 0-6
---@field description string|nil
---@field permissions table|nil Array of permission strings
---@field color string|nil Display color

---Create a new role
---@param dbal table DBAL client instance
---@param params RoleCreateParams
---@return table Created role
function M.createRole(dbal, params)
  return dbal:create('Role', {
    tenantId = params.tenantId,
    name = params.name,
    level = params.level or 1,
    description = params.description,
    permissions = params.permissions and json.encode(params.permissions) or '[]',
    color = params.color or '#808080',
    isDefault = false,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get role by ID
---@param dbal table
---@param roleId string
---@return table|nil Role
function M.getRole(dbal, roleId)
  local role = dbal:read('Role', roleId)
  if role and role.permissions then
    role.permissions = json.decode(role.permissions)
  end
  return role
end

---Get role by name
---@param dbal table
---@param tenantId string
---@param name string
---@return table|nil Role
function M.getRoleByName(dbal, tenantId, name)
  local role = dbal:findFirst('Role', {
    where = { tenantId = tenantId, name = name },
  })
  if role and role.permissions then
    role.permissions = json.decode(role.permissions)
  end
  return role
end

---List all roles for a tenant
---@param dbal table
---@param tenantId string
---@return table[] Roles sorted by level
function M.listRoles(dbal, tenantId)
  local result = dbal:list('Role', {
    where = { tenantId = tenantId },
    orderBy = { level = 'asc' },
    take = 100,
  })
  
  local roles = result.items or {}
  
  -- Parse permissions JSON
  for _, role in ipairs(roles) do
    if role.permissions and type(role.permissions) == 'string' then
      role.permissions = json.decode(role.permissions)
    end
  end
  
  return roles
end

---Update role
---@param dbal table
---@param roleId string
---@param updates table
---@return table Updated role
function M.updateRole(dbal, roleId, updates)
  if updates.permissions and type(updates.permissions) == 'table' then
    updates.permissions = json.encode(updates.permissions)
  end
  updates.updatedAt = os.time() * 1000
  return dbal:update('Role', roleId, updates)
end

---Add permission to role
---@param dbal table
---@param roleId string
---@param permission string
---@return table Updated role
function M.addPermission(dbal, roleId, permission)
  local role = M.getRole(dbal, roleId)
  if not role then
    error('Role not found: ' .. roleId)
  end
  
  local perms = role.permissions or {}
  
  -- Check if already has permission
  for _, p in ipairs(perms) do
    if p == permission then
      return role
    end
  end
  
  table.insert(perms, permission)
  return M.updateRole(dbal, roleId, { permissions = perms })
end

---Remove permission from role
---@param dbal table
---@param roleId string
---@param permission string
---@return table Updated role
function M.removePermission(dbal, roleId, permission)
  local role = M.getRole(dbal, roleId)
  if not role then
    error('Role not found: ' .. roleId)
  end
  
  local perms = role.permissions or {}
  local newPerms = {}
  
  for _, p in ipairs(perms) do
    if p ~= permission then
      table.insert(newPerms, p)
    end
  end
  
  return M.updateRole(dbal, roleId, { permissions = newPerms })
end

---Check if role has permission
---@param dbal table
---@param roleId string
---@param permission string
---@return boolean
function M.hasPermission(dbal, roleId, permission)
  local role = M.getRole(dbal, roleId)
  if not role then
    return false
  end
  
  for _, p in ipairs(role.permissions or {}) do
    if p == permission or p == '*' then
      return true
    end
  end
  
  return false
end

---Delete role
---@param dbal table
---@param roleId string
---@return boolean Success
function M.deleteRole(dbal, roleId)
  return dbal:delete('Role', roleId)
end

---------------------------------------------------------------------------
-- USER ROLE ASSIGNMENT
---------------------------------------------------------------------------

---Assign role to user
---@param dbal table
---@param userId string
---@param roleId string
---@return table Created assignment
function M.assignRoleToUser(dbal, userId, roleId)
  -- Check if already assigned
  local existing = dbal:findFirst('UserRole', {
    where = { userId = userId, roleId = roleId },
  })
  
  if existing then
    return existing
  end
  
  return dbal:create('UserRole', {
    userId = userId,
    roleId = roleId,
    createdAt = os.time() * 1000,
  })
end

---Remove role from user
---@param dbal table
---@param userId string
---@param roleId string
---@return boolean Success
function M.removeRoleFromUser(dbal, userId, roleId)
  local assignment = dbal:findFirst('UserRole', {
    where = { userId = userId, roleId = roleId },
  })
  
  if assignment then
    return dbal:delete('UserRole', assignment.id)
  end
  
  return false
end

---Get user's roles
---@param dbal table
---@param userId string
---@return table[] Roles
function M.getUserRoles(dbal, userId)
  local assignments = dbal:list('UserRole', {
    where = { userId = userId },
    take = 100,
  })
  
  local roles = {}
  for _, assignment in ipairs(assignments.items or {}) do
    local role = M.getRole(dbal, assignment.roleId)
    if role then
      table.insert(roles, role)
    end
  end
  
  return roles
end

---Get effective permission level for user
---@param dbal table
---@param userId string
---@return number Maximum level from all roles
function M.getEffectiveLevel(dbal, userId)
  local roles = M.getUserRoles(dbal, userId)
  local maxLevel = 0
  
  for _, role in ipairs(roles) do
    if (role.level or 0) > maxLevel then
      maxLevel = role.level
    end
  end
  
  return maxLevel
end

---Get all permissions for user
---@param dbal table
---@param userId string
---@return table Unique permissions
function M.getAllUserPermissions(dbal, userId)
  local roles = M.getUserRoles(dbal, userId)
  local permSet = {}
  
  for _, role in ipairs(roles) do
    for _, perm in ipairs(role.permissions or {}) do
      permSet[perm] = true
    end
  end
  
  local perms = {}
  for perm, _ in pairs(permSet) do
    table.insert(perms, perm)
  end
  
  table.sort(perms)
  return perms
end

---Check if user has specific permission
---@param dbal table
---@param userId string
---@param permission string
---@return boolean
function M.userHasPermission(dbal, userId, permission)
  local perms = M.getAllUserPermissions(dbal, userId)
  
  for _, p in ipairs(perms) do
    if p == permission or p == '*' then
      return true
    end
  end
  
  return false
end

---------------------------------------------------------------------------
-- DEFAULT ROLES
---------------------------------------------------------------------------

---Create default roles for a tenant
---@param dbal table
---@param tenantId string
---@return table[] Created roles
function M.createDefaultRoles(dbal, tenantId)
  local roles = {}
  
  -- Public role
  table.insert(roles, M.createRole(dbal, {
    tenantId = tenantId,
    name = 'Guest',
    level = 0,
    description = 'Unauthenticated visitor',
    permissions = {'view:public'},
    color = '#9E9E9E',
  }))
  
  -- User role
  table.insert(roles, M.createRole(dbal, {
    tenantId = tenantId,
    name = 'User',
    level = 1,
    description = 'Registered user',
    permissions = {'view:public', 'view:private', 'edit:own'},
    color = '#2196F3',
  }))
  
  -- Moderator role
  table.insert(roles, M.createRole(dbal, {
    tenantId = tenantId,
    name = 'Moderator',
    level = 2,
    description = 'Content moderator',
    permissions = {'view:public', 'view:private', 'edit:own', 'moderate:content'},
    color = '#4CAF50',
  }))
  
  -- Admin role
  table.insert(roles, M.createRole(dbal, {
    tenantId = tenantId,
    name = 'Admin',
    level = 3,
    description = 'Administrator',
    permissions = {'view:*', 'edit:*', 'manage:users', 'manage:content'},
    color = '#FF9800',
  }))
  
  -- God role
  table.insert(roles, M.createRole(dbal, {
    tenantId = tenantId,
    name = 'God',
    level = 4,
    description = 'Full access',
    permissions = {'*'},
    color = '#F44336',
  }))
  
  return roles
end

return M
