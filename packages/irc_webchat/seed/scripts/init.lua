---@class InstallContext
---@field version string Version number

---@class InstallResult
---@field message string Installation message
---@field version? string Optional version number

local M = {}

---@param context InstallContext Installation context object
---@return InstallResult Installation result
function M.on_install(context)
  return { message = "IRC Webchat installed", version = context.version }
end

---@return InstallResult Uninstallation result
function M.on_uninstall()
  return { message = "IRC Webchat removed" }
end

return M
