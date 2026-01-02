-- Status utilities for workflow runs

---@class StatusModule
local M = {}

---@alias StatusColor "success" | "error" | "warning" | "info" | "default"

---Get color for run status
---@param status RunStatus
---@return StatusColor
function M.getStatusColor(status)
  if status == "success" then
    return "success"
  elseif status == "failure" then
    return "error"
  elseif status == "pending" or status == "in_progress" then
    return "warning"
  elseif status == "cancelled" or status == "skipped" then
    return "default"
  else
    return "info"
  end
end

---Get icon name for run status
---@param status RunStatus
---@return string Icon name from fakemui/icons
function M.getStatusIcon(status)
  if status == "success" then
    return "CheckCircle"
  elseif status == "failure" then
    return "XCircle"
  elseif status == "pending" then
    return "Clock"
  elseif status == "in_progress" then
    return "Loader"
  elseif status == "cancelled" then
    return "Cancel"
  elseif status == "skipped" then
    return "ArrowRight"
  else
    return "Info"
  end
end

---Get human-readable status label
---@param status RunStatus
---@return string
function M.getStatusLabel(status)
  local labels = {
    success = "Success",
    failure = "Failed",
    pending = "Pending",
    in_progress = "Running",
    cancelled = "Cancelled",
    skipped = "Skipped"
  }
  
  return labels[status] or status
end

---Render status badge component
---@param status RunStatus
---@return table UIComponent
function M.renderBadge(status)
  return {
    type = "Chip",
    props = {
      label = M.getStatusLabel(status),
      color = M.getStatusColor(status),
      size = "small",
      icon = M.getStatusIcon(status)
    }
  }
end

---Format duration in human-readable form
---@param seconds number Duration in seconds
---@return string Formatted duration
function M.formatDuration(seconds)
  if seconds < 60 then
    return math.floor(seconds) .. "s"
  elseif seconds < 3600 then
    local mins = math.floor(seconds / 60)
    local secs = math.floor(seconds % 60)
    return mins .. "m " .. secs .. "s"
  else
    local hours = math.floor(seconds / 3600)
    local mins = math.floor((seconds % 3600) / 60)
    return hours .. "h " .. mins .. "m"
  end
end

---Format timestamp as relative time
---@param timestamp string ISO timestamp
---@return string Relative time string
function M.formatRelativeTime(timestamp)
  -- Placeholder - would calculate relative time
  return timestamp
end

return M
