-- Get status badge text for a log

---@class GetStatusBadge
local M = {}

---Get status badge text for a log entry
---@param log AuditLog Log entry to check
---@return string? Badge text or nil if successful
function M.getStatusBadge(log)
  if log.success then
    return nil
  end
  return "Failed"
end

return M
