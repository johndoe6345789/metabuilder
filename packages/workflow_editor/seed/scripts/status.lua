-- Workflow run status utilities
local M = {}

M.PENDING = "pending"
M.RUNNING = "running"
M.SUCCESS = "success"
M.FAILED = "failed"
M.CANCELLED = "cancelled"

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
