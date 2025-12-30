---@class UILevel2
local M = {}

---@class InstallContext
---@field version string

---@class InstallResult
---@field message string
---@field version string

---@param ctx InstallContext
---@return InstallResult
function M.on_install(ctx) return { message = "Level 2 installed", version = ctx.version } end

return M
