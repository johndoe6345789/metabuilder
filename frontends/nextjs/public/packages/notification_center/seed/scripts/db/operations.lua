-- notification_center/seed/scripts/db/operations.lua
-- DBAL operations for Notification entity
-- @module notification_center.db.operations

local M = {}

---@class NotificationCreateParams
---@field tenantId string
---@field userId string
---@field type string info|warning|success|error|mention|reply|follow|like|system
---@field title string
---@field message string
---@field icon string|nil
---@field data table|nil
---@field expiresAt number|nil Unix timestamp

---Create a new notification
---@param dbal table DBAL client instance
---@param params NotificationCreateParams
---@return table Created notification
function M.create(dbal, params)
  local json = require('json')
  
  return dbal:create('Notification', {
    tenantId = params.tenantId,
    userId = params.userId,
    type = params.type,
    title = params.title,
    message = params.message,
    icon = params.icon,
    read = false,
    data = params.data and json.encode(params.data) or nil,
    createdAt = os.time() * 1000,
    expiresAt = params.expiresAt and (params.expiresAt * 1000) or nil,
  })
end

---List notifications for a user
---@param dbal table DBAL client instance
---@param userId string
---@param unreadOnly boolean|nil Only return unread notifications
---@param take number|nil
---@param skip number|nil
---@return table List result with items and total
function M.list(dbal, userId, unreadOnly, take, skip)
  local where = { userId = userId }
  
  if unreadOnly then
    where.read = false
  end
  
  return dbal:list('Notification', {
    where = where,
    orderBy = { createdAt = 'desc' },
    take = take or 20,
    skip = skip or 0,
  })
end

---Get unread notification count
---@param dbal table DBAL client instance
---@param userId string
---@return number Unread count
function M.getUnreadCount(dbal, userId)
  local result = M.list(dbal, userId, true, 1000, 0)
  return result.total or #(result.items or {})
end

---Mark a notification as read
---@param dbal table DBAL client instance
---@param notificationId string
---@return table Updated notification
function M.markAsRead(dbal, notificationId)
  return dbal:update('Notification', notificationId, {
    read = true,
  })
end

---Mark all notifications as read for a user
---@param dbal table DBAL client instance
---@param userId string
---@return number Number of notifications updated
function M.markAllAsRead(dbal, userId)
  local unread = M.list(dbal, userId, true, 1000, 0)
  local count = 0
  
  for _, notification in ipairs(unread.items or {}) do
    dbal:update('Notification', notification.id, { read = true })
    count = count + 1
  end
  
  return count
end

---Delete a notification
---@param dbal table DBAL client instance
---@param notificationId string
---@return boolean Success
function M.delete(dbal, notificationId)
  return dbal:delete('Notification', notificationId)
end

---Delete all read notifications for a user
---@param dbal table DBAL client instance
---@param userId string
---@return number Number deleted
function M.deleteRead(dbal, userId)
  local result = dbal:list('Notification', {
    where = { userId = userId, read = true },
    take = 1000,
  })
  
  local count = 0
  for _, notification in ipairs(result.items or {}) do
    dbal:delete('Notification', notification.id)
    count = count + 1
  end
  
  return count
end

---Delete expired notifications
---@param dbal table DBAL client instance
---@param tenantId string
---@return number Number deleted
function M.deleteExpired(dbal, tenantId)
  local now = os.time() * 1000
  local result = dbal:list('Notification', {
    where = { tenantId = tenantId },
    take = 1000,
  })
  
  local count = 0
  for _, notification in ipairs(result.items or {}) do
    if notification.expiresAt and notification.expiresAt < now then
      dbal:delete('Notification', notification.id)
      count = count + 1
    end
  end
  
  return count
end

-- Convenience functions for creating typed notifications

---Send an info notification
---@param dbal table
---@param tenantId string
---@param userId string
---@param title string
---@param message string
---@param data table|nil
function M.sendInfo(dbal, tenantId, userId, title, message, data)
  return M.create(dbal, {
    tenantId = tenantId,
    userId = userId,
    type = 'info',
    title = title,
    message = message,
    icon = 'Info',
    data = data,
  })
end

---Send a success notification
---@param dbal table
---@param tenantId string
---@param userId string
---@param title string
---@param message string
---@param data table|nil
function M.sendSuccess(dbal, tenantId, userId, title, message, data)
  return M.create(dbal, {
    tenantId = tenantId,
    userId = userId,
    type = 'success',
    title = title,
    message = message,
    icon = 'CheckCircle',
    data = data,
  })
end

---Send a warning notification
---@param dbal table
---@param tenantId string
---@param userId string
---@param title string
---@param message string
---@param data table|nil
function M.sendWarning(dbal, tenantId, userId, title, message, data)
  return M.create(dbal, {
    tenantId = tenantId,
    userId = userId,
    type = 'warning',
    title = title,
    message = message,
    icon = 'Warning',
    data = data,
  })
end

---Send an error notification
---@param dbal table
---@param tenantId string
---@param userId string
---@param title string
---@param message string
---@param data table|nil
function M.sendError(dbal, tenantId, userId, title, message, data)
  return M.create(dbal, {
    tenantId = tenantId,
    userId = userId,
    type = 'error',
    title = title,
    message = message,
    icon = 'Error',
    data = data,
  })
end

---Send a mention notification
---@param dbal table
---@param tenantId string
---@param userId string
---@param mentionedBy string Username who mentioned
---@param context string Where they were mentioned
---@param link string|nil Link to the mention
function M.sendMention(dbal, tenantId, userId, mentionedBy, context, link)
  return M.create(dbal, {
    tenantId = tenantId,
    userId = userId,
    type = 'mention',
    title = 'You were mentioned',
    message = mentionedBy .. ' mentioned you in ' .. context,
    icon = 'AlternateEmail',
    data = { mentionedBy = mentionedBy, link = link },
  })
end

return M
