---@class SocialHub
local M = {}

---@class InstallContext
---@field version string

---@class InstallResult
---@field message string
---@field version string

---@class UninstallResult
---@field message string

---@param context InstallContext
---@return InstallResult
function M.on_install(context)
  return { message = "Social Hub installed", version = context.version }
end

---@return UninstallResult
function M.on_uninstall()
  return { message = "Social Hub removed" }
end

return M
