-- Filter logs by username

---@class FilterByUsername
local M = {}

---Filter logs by username (partial match, case-insensitive)
---@param logs AuditLog[]? Array of audit log entries
---@param username string? Username to filter by (empty = no filter)
---@return AuditLog[] Filtered logs
function M.filterByUsername(logs, username)
  if not username or username == "" then
    return logs or {}
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

return M
