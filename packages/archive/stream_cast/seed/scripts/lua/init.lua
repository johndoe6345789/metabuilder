---@class StreamCast
local M = {}

---@class InstallContext
---@field version? string

---@class InstallResult
---@field message string
---@field version? string

---@class UninstallResult
---@field message string

---@param context InstallContext
---@return InstallResult
function M.on_install(context)
  return { message = "Stream Cast installed", version = context.version }
end

---@return UninstallResult
function M.on_uninstall()
  return { message = "Stream Cast removed" }
end

return M
