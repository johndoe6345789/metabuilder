-- audit_log/seed/scripts/db/operations.lua
-- DBAL operations for AuditLog entity
-- @module audit_log.db.operations

local M = {}

---@class AuditLogCreateParams
---@field tenantId string
---@field userId string|nil
---@field username string|nil
---@field action string
---@field entity string
---@field entityId string|nil
---@field oldValue table|nil
---@field newValue table|nil
---@field ipAddress string|nil
---@field userAgent string|nil
---@field details table|nil

---Create a new audit log entry
---@param dbal table DBAL client instance
---@param params AuditLogCreateParams
---@return table Created audit log record
function M.create(dbal, params)
  local json = require('json')
  
  return dbal:create('AuditLog', {
    tenantId = params.tenantId,
    userId = params.userId,
    username = params.username,
    action = params.action,
    entity = params.entity,
    entityId = params.entityId,
    oldValue = params.oldValue and json.encode(params.oldValue) or nil,
    newValue = params.newValue and json.encode(params.newValue) or nil,
    ipAddress = params.ipAddress,
    userAgent = params.userAgent,
    details = params.details and json.encode(params.details) or nil,
    timestamp = os.time() * 1000,
  })
end

---@class AuditLogListParams
---@field tenantId string
---@field userId string|nil
---@field action string|nil
---@field entity string|nil
---@field entityId string|nil
---@field startTime number|nil Unix timestamp
---@field endTime number|nil Unix timestamp
---@field take number|nil
---@field skip number|nil

---List audit logs with filters
---@param dbal table DBAL client instance
---@param params AuditLogListParams
---@return table[] List of audit log records
function M.list(dbal, params)
  local where = { tenantId = params.tenantId }
  
  if params.userId then
    where.userId = params.userId
  end
  
  if params.action then
    where.action = params.action
  end
  
  if params.entity then
    where.entity = params.entity
  end
  
  if params.entityId then
    where.entityId = params.entityId
  end
  
  -- Time range filtering would need DBAL support for comparison operators
  -- For now, return all and filter in Lua
  local result = dbal:list('AuditLog', {
    where = where,
    orderBy = { timestamp = 'desc' },
    take = params.take or 50,
    skip = params.skip or 0,
  })
  
  -- Filter by time range if specified
  if params.startTime or params.endTime then
    local filtered = {}
    for _, log in ipairs(result.items or {}) do
      local ts = log.timestamp
      local inRange = true
      
      if params.startTime and ts < (params.startTime * 1000) then
        inRange = false
      end
      
      if params.endTime and ts > (params.endTime * 1000) then
        inRange = false
      end
      
      if inRange then
        table.insert(filtered, log)
      end
    end
    result.items = filtered
  end
  
  return result
end

---Get audit logs for a specific entity
---@param dbal table DBAL client instance
---@param tenantId string
---@param entity string Entity type
---@param entityId string Entity ID
---@return table[] Audit history for entity
function M.getEntityHistory(dbal, tenantId, entity, entityId)
  return M.list(dbal, {
    tenantId = tenantId,
    entity = entity,
    entityId = entityId,
    take = 100,
  })
end

---Get audit logs for a specific user
---@param dbal table DBAL client instance
---@param tenantId string
---@param userId string
---@param take number|nil
---@return table[] User's audit history
function M.getUserHistory(dbal, tenantId, userId, take)
  return M.list(dbal, {
    tenantId = tenantId,
    userId = userId,
    take = take or 50,
  })
end

---Log a create action
---@param dbal table DBAL client instance
---@param tenantId string
---@param userId string
---@param entity string
---@param entityId string
---@param newValue table Created record
---@param context table|nil Additional context
function M.logCreate(dbal, tenantId, userId, entity, entityId, newValue, context)
  return M.create(dbal, {
    tenantId = tenantId,
    userId = userId,
    action = 'create',
    entity = entity,
    entityId = entityId,
    newValue = newValue,
    details = context,
  })
end

---Log an update action
---@param dbal table DBAL client instance
---@param tenantId string
---@param userId string
---@param entity string
---@param entityId string
---@param oldValue table Previous state
---@param newValue table New state
---@param context table|nil Additional context
function M.logUpdate(dbal, tenantId, userId, entity, entityId, oldValue, newValue, context)
  return M.create(dbal, {
    tenantId = tenantId,
    userId = userId,
    action = 'update',
    entity = entity,
    entityId = entityId,
    oldValue = oldValue,
    newValue = newValue,
    details = context,
  })
end

---Log a delete action
---@param dbal table DBAL client instance
---@param tenantId string
---@param userId string
---@param entity string
---@param entityId string
---@param oldValue table Deleted record
---@param context table|nil Additional context
function M.logDelete(dbal, tenantId, userId, entity, entityId, oldValue, context)
  return M.create(dbal, {
    tenantId = tenantId,
    userId = userId,
    action = 'delete',
    entity = entity,
    entityId = entityId,
    oldValue = oldValue,
    details = context,
  })
end

---Log a login action
---@param dbal table DBAL client instance
---@param tenantId string
---@param userId string
---@param username string
---@param ipAddress string|nil
---@param userAgent string|nil
function M.logLogin(dbal, tenantId, userId, username, ipAddress, userAgent)
  return M.create(dbal, {
    tenantId = tenantId,
    userId = userId,
    username = username,
    action = 'login',
    entity = 'User',
    entityId = userId,
    ipAddress = ipAddress,
    userAgent = userAgent,
  })
end

---Log a logout action
---@param dbal table DBAL client instance
---@param tenantId string
---@param userId string
---@param username string
function M.logLogout(dbal, tenantId, userId, username)
  return M.create(dbal, {
    tenantId = tenantId,
    userId = userId,
    username = username,
    action = 'logout',
    entity = 'User',
    entityId = userId,
  })
end

return M
