---@class UIIntro
local M = {}

---@class InstallContext
---@field version string

---@class InstallResult
---@field message string
---@field version string

---@param ctx InstallContext
---@return InstallResult
function M.on_install(ctx)
  return { message = "Intro Section installed", version = ctx.version }
end

return M
