-- Audit log filtering logic
local M = {}

---@class AuditLog
---@field id string
---@field operation string
---@field resource string
---@field resourceId string
---@field username string
---@field timestamp number
---@field ipAddress string
---@field success boolean
---@field errorMessage string?

---@class FilterOptions
---@field operations string[]
---@field resources string[]
---@field usernames string[]

---@class ApplyFiltersInput
---@field operation string?
---@field resource string?
---@field success boolean?
---@field username string?
---@field startTime number?
---@field endTime number?

--- Filter logs by operation type
---@param logs AuditLog[] | nil
---@param operation string?
---@return AuditLog[]
function M.filterByOperation(logs, operation)
  if not operation or operation == "" then
    return logs
  end

  local result = {}
  for _, log in ipairs(logs or {}) do
    if log.operation == operation then
      result[#result + 1] = log
    end
  end
  return result
end

--- Filter logs by resource type
---@param logs AuditLog[] | nil
---@param resource string?
---@return AuditLog[]
function M.filterByResource(logs, resource)
  if not resource or resource == "" then
    return logs
  end

  local result = {}
  for _, log in ipairs(logs or {}) do
    if log.resource == resource then
      result[#result + 1] = log
    end
  end
  return result
end

--- Filter logs by success status
---@param logs AuditLog[] | nil
---@param success boolean?
---@return AuditLog[]
function M.filterBySuccess(logs, success)
  if success == nil then
    return logs
  end

  local result = {}
  for _, log in ipairs(logs or {}) do
    if log.success == success then
      result[#result + 1] = log
    end
  end
  return result
end

--- Filter logs by username
---@param logs AuditLog[] | nil
---@param username string?
---@return AuditLog[]
function M.filterByUsername(logs, username)
  if not username or username == "" then
    return logs
  end

  local result = {}
  local lowerUsername = string.lower(username)
  for _, log in ipairs(logs or {}) do
    if log.username and string.match(string.lower(log.username), lowerUsername) then
      result[#result + 1] = log
    end
  end
  return result
end

--- Filter logs by date range (timestamps in milliseconds)
---@param logs AuditLog[] | nil
---@param startTime number?
---@param endTime number?
---@return AuditLog[]
function M.filterByDateRange(logs, startTime, endTime)
  local result = {}
  for _, log in ipairs(logs or {}) do
    local ts = log.timestamp
    local include = true
    if startTime and ts < startTime then
      include = false
    end
    if endTime and ts > endTime then
      include = false
    end
    if include then
      result[#result + 1] = log
    end
  end
  return result
end

--- Apply multiple filters to logs
---@param logs AuditLog[] | nil
---@param filters ApplyFiltersInput
---@return AuditLog[]
function M.applyFilters(logs, filters)
  filters = filters or {}
  local result = logs

  if filters.operation then
    result = M.filterByOperation(result, filters.operation)
  end

  if filters.resource then
    result = M.filterByResource(result, filters.resource)
  end

  if filters.success ~= nil then
    result = M.filterBySuccess(result, filters.success)
  end

  if filters.username then
    result = M.filterByUsername(result, filters.username)
  end

  if filters.startTime or filters.endTime then
    result = M.filterByDateRange(result, filters.startTime, filters.endTime)
  end

  return result
end

--- Get unique values for filter dropdowns
---@param logs AuditLog[] | nil
---@return FilterOptions
function M.getFilterOptions(logs)
  local operations = {}
  local resources = {}
  local usernames = {}

  for _, log in ipairs(logs or {}) do
    if log.operation then
      operations[log.operation] = true
    end
    if log.resource then
      resources[log.resource] = true
    end
    if log.username then
      usernames[log.username] = true
    end
  end

  local opList = {}
  for op in pairs(operations) do
    opList[#opList + 1] = op
  end
  table.sort(opList)

  local resList = {}
  for res in pairs(resources) do
    resList[#resList + 1] = res
  end
  table.sort(resList)

  local userList = {}
  for user in pairs(usernames) do
    userList[#userList + 1] = user
  end
  table.sort(userList)

  return {
    operations = opList,
    resources = resList,
    usernames = userList
  }
end

return M
