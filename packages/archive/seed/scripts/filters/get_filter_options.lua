-- Get unique values for filter dropdowns

---@class GetFilterOptions
local M = {}

---Get unique values for filter dropdowns
---@param logs AuditLog[]? Array of audit log entries
---@return FilterOptions Unique filter options
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
