---@class ArcadeLobby
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
  return { message = "Arcade Lobby installed", version = context.version }
end

---@return UninstallResult
function M.on_uninstall()
  return { message = "Arcade Lobby removed" }
end

return M
