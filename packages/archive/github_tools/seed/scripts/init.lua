-- GitHub Tools initialization
-- Entry point for package setup

---@class InitModule
local M = {}

---@class InitContext
---@field config GitHubConfig GitHub configuration
---@field user table Current user info

---@class InitResult
---@field success boolean
---@field message string
---@field config GitHubConfig

---Initialize the GitHub Tools package
---@param ctx InitContext Initialization context
---@return InitResult
function M.initialize(ctx)
  local config = ctx.config or {}
  
  if not config.owner or config.owner == "" then
    return {
      success = false,
      message = "Repository owner is required",
      config = config
    }
  end
  
  if not config.repo or config.repo == "" then
    return {
      success = false,
      message = "Repository name is required",
      config = config
    }
  end
  
  log("GitHub Tools initialized for " .. config.owner .. "/" .. config.repo)
  
  return {
    success = true,
    message = "GitHub Tools ready",
    config = config
  }
end

return M
