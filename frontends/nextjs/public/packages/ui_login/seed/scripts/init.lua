---@class UILogin
local M = {}

---@class InstallContext
---@field version string

---@class InstallResult
---@field message string
---@field version string

---@class UninstallResult
---@field message string

---@param ctx InstallContext
---@return InstallResult
function M.on_install(ctx)
  return { message = "Login Page installed", version = ctx.version }
end

---@return UninstallResult
function M.on_uninstall()
  return { message = "Login Page removed" }
end

return M
