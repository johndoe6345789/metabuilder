---@class ForumForge
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
  return { message = "Forum Forge installed", version = context.version }
end

---@return UninstallResult
function M.on_uninstall()
  return { message = "Forum Forge removed" }
end

return M
