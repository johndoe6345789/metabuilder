--- IRC Webchat package entry point
--- Provides IRC-style chat functionality for web interfaces
---@class IRCWebchatModule : IRCWebchat
---@field name string Package name
---@field version string Package version

---@class InstallContext
---@field version string Version number

---@class InstallResult
---@field message string Installation message
---@field version? string Optional version number

local M = {}

M.name = "irc_webchat"
M.version = "1.0.0"

--- Load utility modules
M.formatTime = require("format_time")
M.handleCommand = require("handle_command")
M.sendMessage = require("send_message")
M.userJoin = require("user_join")
M.userLeave = require("user_leave")

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
