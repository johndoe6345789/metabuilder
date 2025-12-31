-- dashboard/seed/scripts/db/operations.lua
-- DBAL operations for Dashboard widgets and layouts
-- @module dashboard.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- DASHBOARD LAYOUT OPERATIONS
---------------------------------------------------------------------------

---@class DashboardLayoutParams
---@field tenantId string
---@field userId string|nil User-specific or tenant-wide
---@field name string Layout name
---@field widgets table[] Widget configurations
---@field settings table|nil Layout settings

---Save dashboard layout
---@param dbal table DBAL client instance
---@param params DashboardLayoutParams
---@return table Created/updated layout
function M.saveLayout(dbal, params)
  local where = {
    tenantId = params.tenantId,
    name = params.name,
  }
  
  if params.userId then
    where.userId = params.userId
  end
  
  local existing = dbal:findFirst('DashboardLayout', { where = where })
  
  if existing then
    return dbal:update('DashboardLayout', existing.id, {
      widgets = json.encode(params.widgets),
      settings = params.settings and json.encode(params.settings) or nil,
      updatedAt = os.time() * 1000,
    })
  end
  
  return dbal:create('DashboardLayout', {
    tenantId = params.tenantId,
    userId = params.userId,
    name = params.name,
    widgets = json.encode(params.widgets),
    settings = params.settings and json.encode(params.settings) or '{}',
    isDefault = false,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get layout by name
---@param dbal table
---@param tenantId string
---@param name string
---@param userId string|nil
---@return table|nil Layout
function M.getLayout(dbal, tenantId, name, userId)
  local where = { tenantId = tenantId, name = name }
  
  if userId then
    where.userId = userId
  end
  
  local layout = dbal:findFirst('DashboardLayout', { where = where })
  
  if layout then
    layout.widgets = json.decode(layout.widgets or '[]')
    layout.settings = json.decode(layout.settings or '{}')
  end
  
  return layout
end

---Get user's default layout
---@param dbal table
---@param tenantId string
---@param userId string
---@return table|nil Layout
function M.getDefaultLayout(dbal, tenantId, userId)
  -- First try user's default
  local userDefault = dbal:findFirst('DashboardLayout', {
    where = { tenantId = tenantId, userId = userId, isDefault = true },
  })
  
  if userDefault then
    userDefault.widgets = json.decode(userDefault.widgets or '[]')
    userDefault.settings = json.decode(userDefault.settings or '{}')
    return userDefault
  end
  
  -- Fall back to tenant default
  local tenantDefault = dbal:findFirst('DashboardLayout', {
    where = { tenantId = tenantId, isDefault = true },
  })
  
  if tenantDefault then
    tenantDefault.widgets = json.decode(tenantDefault.widgets or '[]')
    tenantDefault.settings = json.decode(tenantDefault.settings or '{}')
    return tenantDefault
  end
  
  return nil
end

---List all layouts
---@param dbal table
---@param tenantId string
---@param userId string|nil
---@return table[] Layouts
function M.listLayouts(dbal, tenantId, userId)
  local where = { tenantId = tenantId }
  
  if userId then
    where.userId = userId
  end
  
  local result = dbal:list('DashboardLayout', {
    where = where,
    orderBy = { name = 'asc' },
    take = 50,
  })
  
  return result.items or {}
end

---Set layout as default
---@param dbal table
---@param tenantId string
---@param layoutId string
---@param userId string|nil
function M.setDefault(dbal, tenantId, layoutId, userId)
  -- Clear existing defaults
  local layouts = M.listLayouts(dbal, tenantId, userId)
  for _, layout in ipairs(layouts) do
    if layout.isDefault then
      dbal:update('DashboardLayout', layout.id, { isDefault = false })
    end
  end
  
  return dbal:update('DashboardLayout', layoutId, {
    isDefault = true,
    updatedAt = os.time() * 1000,
  })
end

---Delete layout
---@param dbal table
---@param layoutId string
---@return boolean Success
function M.deleteLayout(dbal, layoutId)
  return dbal:delete('DashboardLayout', layoutId)
end

---------------------------------------------------------------------------
-- WIDGET OPERATIONS
---------------------------------------------------------------------------

---@class WidgetConfig
---@field id string Unique widget ID
---@field type string Widget type (stats, chart, list, etc.)
---@field title string Widget title
---@field x number Grid x position
---@field y number Grid y position
---@field w number Grid width
---@field h number Grid height
---@field config table Widget-specific config

---Add widget to layout
---@param dbal table
---@param layoutId string
---@param widget WidgetConfig
---@return table Updated layout
function M.addWidget(dbal, layoutId, widget)
  local layout = dbal:read('DashboardLayout', layoutId)
  if not layout then
    error('Layout not found: ' .. layoutId)
  end
  
  local widgets = json.decode(layout.widgets or '[]')
  
  -- Generate ID if not provided
  if not widget.id then
    widget.id = 'widget_' .. os.time() .. '_' .. math.random(1000, 9999)
  end
  
  table.insert(widgets, widget)
  
  return dbal:update('DashboardLayout', layoutId, {
    widgets = json.encode(widgets),
    updatedAt = os.time() * 1000,
  })
end

---Update widget in layout
---@param dbal table
---@param layoutId string
---@param widgetId string
---@param updates table
---@return table Updated layout
function M.updateWidget(dbal, layoutId, widgetId, updates)
  local layout = dbal:read('DashboardLayout', layoutId)
  if not layout then
    error('Layout not found: ' .. layoutId)
  end
  
  local widgets = json.decode(layout.widgets or '[]')
  
  for i, widget in ipairs(widgets) do
    if widget.id == widgetId then
      for key, value in pairs(updates) do
        widgets[i][key] = value
      end
      break
    end
  end
  
  return dbal:update('DashboardLayout', layoutId, {
    widgets = json.encode(widgets),
    updatedAt = os.time() * 1000,
  })
end

---Remove widget from layout
---@param dbal table
---@param layoutId string
---@param widgetId string
---@return table Updated layout
function M.removeWidget(dbal, layoutId, widgetId)
  local layout = dbal:read('DashboardLayout', layoutId)
  if not layout then
    error('Layout not found: ' .. layoutId)
  end
  
  local widgets = json.decode(layout.widgets or '[]')
  local newWidgets = {}
  
  for _, widget in ipairs(widgets) do
    if widget.id ~= widgetId then
      table.insert(newWidgets, widget)
    end
  end
  
  return dbal:update('DashboardLayout', layoutId, {
    widgets = json.encode(newWidgets),
    updatedAt = os.time() * 1000,
  })
end

---Update widget positions (after drag)
---@param dbal table
---@param layoutId string
---@param positions table[] Array of {id, x, y, w, h}
---@return table Updated layout
function M.updatePositions(dbal, layoutId, positions)
  local layout = dbal:read('DashboardLayout', layoutId)
  if not layout then
    error('Layout not found: ' .. layoutId)
  end
  
  local widgets = json.decode(layout.widgets or '[]')
  
  -- Create lookup map
  local posMap = {}
  for _, pos in ipairs(positions) do
    posMap[pos.id] = pos
  end
  
  -- Update positions
  for i, widget in ipairs(widgets) do
    local pos = posMap[widget.id]
    if pos then
      widgets[i].x = pos.x
      widgets[i].y = pos.y
      widgets[i].w = pos.w or widgets[i].w
      widgets[i].h = pos.h or widgets[i].h
    end
  end
  
  return dbal:update('DashboardLayout', layoutId, {
    widgets = json.encode(widgets),
    updatedAt = os.time() * 1000,
  })
end

---------------------------------------------------------------------------
-- WIDGET DATA CACHE
---------------------------------------------------------------------------

---Cache widget data
---@param dbal table
---@param tenantId string
---@param widgetType string
---@param cacheKey string
---@param data table
---@param ttlSeconds number|nil
function M.cacheWidgetData(dbal, tenantId, widgetType, cacheKey, data, ttlSeconds)
  local key = widgetType .. ':' .. cacheKey
  local expiresAt = ttlSeconds and ((os.time() + ttlSeconds) * 1000) or nil
  
  local existing = dbal:findFirst('WidgetCache', {
    where = { tenantId = tenantId, cacheKey = key },
  })
  
  if existing then
    return dbal:update('WidgetCache', existing.id, {
      data = json.encode(data),
      expiresAt = expiresAt,
      updatedAt = os.time() * 1000,
    })
  end
  
  return dbal:create('WidgetCache', {
    tenantId = tenantId,
    cacheKey = key,
    widgetType = widgetType,
    data = json.encode(data),
    expiresAt = expiresAt,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get cached widget data
---@param dbal table
---@param tenantId string
---@param widgetType string
---@param cacheKey string
---@return table|nil Cached data or nil if expired/not found
function M.getCachedData(dbal, tenantId, widgetType, cacheKey)
  local key = widgetType .. ':' .. cacheKey
  
  local cached = dbal:findFirst('WidgetCache', {
    where = { tenantId = tenantId, cacheKey = key },
  })
  
  if cached then
    -- Check expiry
    if cached.expiresAt and cached.expiresAt < (os.time() * 1000) then
      dbal:delete('WidgetCache', cached.id)
      return nil
    end
    
    return json.decode(cached.data)
  end
  
  return nil
end

---Clear expired cache entries
---@param dbal table
---@param tenantId string
---@return number Number of entries cleared
function M.clearExpiredCache(dbal, tenantId)
  local now = os.time() * 1000
  local result = dbal:list('WidgetCache', {
    where = { tenantId = tenantId },
    take = 10000,
  })
  
  local count = 0
  for _, entry in ipairs(result.items or {}) do
    if entry.expiresAt and entry.expiresAt < now then
      dbal:delete('WidgetCache', entry.id)
      count = count + 1
    end
  end
  
  return count
end

return M
