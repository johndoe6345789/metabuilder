-- Toast notification utilities
local M = {}

function M.success(message, duration)
  return {
    type = "toast",
    variant = "success",
    message = message,
    duration = duration or 3000,
    icon = "check"
  }
end

function M.error(message, duration)
  return {
    type = "toast",
    variant = "error",
    message = message,
    duration = duration or 5000,
    icon = "error"
  }
end

function M.warning(message, duration)
  return {
    type = "toast",
    variant = "warning",
    message = message,
    duration = duration or 4000,
    icon = "warning"
  }
end

function M.info(message, duration)
  return {
    type = "toast",
    variant = "info",
    message = message,
    duration = duration or 3000,
    icon = "info"
  }
end

return M
