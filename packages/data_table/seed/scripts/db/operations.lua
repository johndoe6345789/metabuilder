-- data_table/seed/scripts/db/operations.lua
-- DBAL operations for generic data table management
-- Provides reusable CRUD helpers for any entity
-- @module data_table.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- GENERIC CRUD OPERATIONS
---------------------------------------------------------------------------

---Create a record in any entity
---@param dbal table DBAL client instance
---@param entity string Entity name
---@param data table Record data
---@return table Created record
function M.create(dbal, entity, data)
  -- Auto-add timestamps if not present
  if not data.createdAt then
    data.createdAt = os.time() * 1000
  end
  return dbal:create(entity, data)
end

---Read a record by ID
---@param dbal table
---@param entity string Entity name
---@param id string Record ID
---@return table|nil Record
function M.read(dbal, entity, id)
  return dbal:read(entity, id)
end

---Update a record
---@param dbal table
---@param entity string Entity name
---@param id string Record ID
---@param data table Fields to update
---@return table Updated record
function M.update(dbal, entity, id, data)
  -- Auto-update timestamp if not present
  if not data.updatedAt then
    data.updatedAt = os.time() * 1000
  end
  return dbal:update(entity, id, data)
end

---Delete a record
---@param dbal table
---@param entity string Entity name
---@param id string Record ID
---@return boolean Success
function M.delete(dbal, entity, id)
  return dbal:delete(entity, id)
end

---List records with filtering and pagination
---@param dbal table
---@param entity string Entity name
---@param options table List options
---@return table List result with items and total
function M.list(dbal, entity, options)
  return dbal:list(entity, {
    where = options.where or {},
    orderBy = options.orderBy or { createdAt = 'desc' },
    take = options.take or 50,
    skip = options.skip or 0,
  })
end

---Find first matching record
---@param dbal table
---@param entity string Entity name
---@param where table Where conditions
---@return table|nil First matching record
function M.findFirst(dbal, entity, where)
  return dbal:findFirst(entity, { where = where })
end

---------------------------------------------------------------------------
-- ADVANCED QUERY HELPERS
---------------------------------------------------------------------------

---Search records by text field
---@param dbal table
---@param entity string Entity name
---@param field string Field to search
---@param query string Search query
---@param tenantId string|nil Tenant filter
---@param take number|nil Max results
---@return table[] Matching records
function M.search(dbal, entity, field, query, tenantId, take)
  local where = {}
  if tenantId then
    where.tenantId = tenantId
  end
  
  local result = dbal:list(entity, {
    where = where,
    take = 1000,
  })
  
  local matches = {}
  local lowerQuery = query:lower()
  
  for _, record in ipairs(result.items or {}) do
    local fieldValue = record[field]
    if fieldValue and type(fieldValue) == 'string' then
      if fieldValue:lower():find(lowerQuery, 1, true) then
        table.insert(matches, record)
        if #matches >= (take or 50) then
          break
        end
      end
    end
  end
  
  return matches
end

---Count records matching conditions
---@param dbal table
---@param entity string Entity name
---@param where table|nil Where conditions
---@return number Count
function M.count(dbal, entity, where)
  local result = dbal:list(entity, {
    where = where or {},
    take = 100000,
  })
  return result.total or #(result.items or {})
end

---Check if record exists
---@param dbal table
---@param entity string Entity name
---@param where table Where conditions
---@return boolean Exists
function M.exists(dbal, entity, where)
  local record = M.findFirst(dbal, entity, where)
  return record ~= nil
end

---Get distinct values for a field
---@param dbal table
---@param entity string Entity name
---@param field string Field name
---@param where table|nil Where conditions
---@return table[] Distinct values
function M.distinct(dbal, entity, field, where)
  local result = dbal:list(entity, {
    where = where or {},
    take = 10000,
  })
  
  local seen = {}
  local values = {}
  
  for _, record in ipairs(result.items or {}) do
    local value = record[field]
    if value ~= nil and not seen[tostring(value)] then
      seen[tostring(value)] = true
      table.insert(values, value)
    end
  end
  
  return values
end

---------------------------------------------------------------------------
-- BULK OPERATIONS
---------------------------------------------------------------------------

---Create multiple records
---@param dbal table
---@param entity string Entity name
---@param records table[] Records to create
---@return table[] Created records
function M.createMany(dbal, entity, records)
  local created = {}
  for _, data in ipairs(records) do
    local record = M.create(dbal, entity, data)
    table.insert(created, record)
  end
  return created
end

---Update multiple records by IDs
---@param dbal table
---@param entity string Entity name
---@param ids table[] Record IDs
---@param data table Fields to update
---@return number Count of updated records
function M.updateMany(dbal, entity, ids, data)
  local count = 0
  for _, id in ipairs(ids) do
    M.update(dbal, entity, id, data)
    count = count + 1
  end
  return count
end

---Delete multiple records by IDs
---@param dbal table
---@param entity string Entity name
---@param ids table[] Record IDs
---@return number Count of deleted records
function M.deleteMany(dbal, entity, ids)
  local count = 0
  for _, id in ipairs(ids) do
    if M.delete(dbal, entity, id) then
      count = count + 1
    end
  end
  return count
end

---Delete records matching conditions
---@param dbal table
---@param entity string Entity name
---@param where table Where conditions
---@return number Count of deleted records
function M.deleteWhere(dbal, entity, where)
  local result = dbal:list(entity, {
    where = where,
    take = 10000,
  })
  
  local count = 0
  for _, record in ipairs(result.items or {}) do
    if M.delete(dbal, entity, record.id) then
      count = count + 1
    end
  end
  
  return count
end

---------------------------------------------------------------------------
-- TABLE CONFIGURATION
---------------------------------------------------------------------------

---@class TableConfig
---@field entity string Entity name
---@field columns table[] Column definitions
---@field defaultSort table|nil Default sort order
---@field pageSize number|nil Default page size
---@field filters table[]|nil Available filters

---Save table configuration
---@param dbal table
---@param tenantId string
---@param tableKey string Unique key for this table config
---@param config TableConfig
---@return table Saved config
function M.saveTableConfig(dbal, tenantId, tableKey, config)
  local existing = dbal:findFirst('TableConfig', {
    where = { tenantId = tenantId, tableKey = tableKey },
  })
  
  if existing then
    return dbal:update('TableConfig', existing.id, {
      config = json.encode(config),
      updatedAt = os.time() * 1000,
    })
  end
  
  return dbal:create('TableConfig', {
    tenantId = tenantId,
    tableKey = tableKey,
    config = json.encode(config),
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get table configuration
---@param dbal table
---@param tenantId string
---@param tableKey string
---@return TableConfig|nil
function M.getTableConfig(dbal, tenantId, tableKey)
  local record = dbal:findFirst('TableConfig', {
    where = { tenantId = tenantId, tableKey = tableKey },
  })
  
  if record and record.config then
    return json.decode(record.config)
  end
  
  return nil
end

---------------------------------------------------------------------------
-- USER PREFERENCES
---------------------------------------------------------------------------

---Save user column preferences
---@param dbal table
---@param userId string
---@param tableKey string
---@param columns table[] Visible columns in order
---@param columnWidths table|nil Column widths
function M.saveUserPreferences(dbal, userId, tableKey, columns, columnWidths)
  local existing = dbal:findFirst('UserTablePreference', {
    where = { userId = userId, tableKey = tableKey },
  })
  
  local data = {
    columns = json.encode(columns),
    columnWidths = columnWidths and json.encode(columnWidths) or nil,
    updatedAt = os.time() * 1000,
  }
  
  if existing then
    return dbal:update('UserTablePreference', existing.id, data)
  end
  
  data.userId = userId
  data.tableKey = tableKey
  data.createdAt = os.time() * 1000
  return dbal:create('UserTablePreference', data)
end

---Get user column preferences
---@param dbal table
---@param userId string
---@param tableKey string
---@return table|nil Preferences
function M.getUserPreferences(dbal, userId, tableKey)
  local record = dbal:findFirst('UserTablePreference', {
    where = { userId = userId, tableKey = tableKey },
  })
  
  if record then
    return {
      columns = record.columns and json.decode(record.columns) or nil,
      columnWidths = record.columnWidths and json.decode(record.columnWidths) or nil,
    }
  end
  
  return nil
end

return M
