-- Workflow run status utilities

---@class StatusBadgeProps
---@field label string
---@field color string

---@class StatusBadge
---@field type string
---@field props StatusBadgeProps

---@class ProgressProps
---@field value number
---@field label string

---@class Progress
---@field type string
---@field props ProgressProps

---@class WorkflowStatusModule
---@field PENDING string
---@field RUNNING string
---@field SUCCESS string
---@field FAILED string
---@field CANCELLED string
---@field render_badge fun(status: string): StatusBadge
---@field render_progress fun(completed: number, total: number): Progress
local M = {}

M.PENDING = "pending"
M.RUNNING = "running"
M.SUCCESS = "success"
M.FAILED = "failed"
M.CANCELLED = "cancelled"

---Render a status badge
---@param status string
---@return StatusBadge
function M.render_badge(status)
  local colors = {
    pending = "default",
    running = "info",
    success = "success",
    failed = "error",
    cancelled = "warning"
  }
  return {
    type = "badge",
    props = {
      label = status,
      color = colors[status] or "default"
    }
  }
end

---Render a progress indicator
---@param completed number
---@param total number
---@return Progress
function M.render_progress(completed, total)
  local percent = total > 0 and (completed / total * 100) or 0
  return {
    type = "progress",
    props = {
      value = percent,
      label = completed .. "/" .. total
    }
  }
end

return M
