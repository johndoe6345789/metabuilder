---@meta
-- Type definitions for irc_webchat package

---@alias MessageType "message" | "system" | "command" | "join" | "leave"

---@class IRCMessage
---@field id string Message identifier
---@field username string Username of the sender
---@field userId string User identifier
---@field message string Message content
---@field type MessageType Message type
---@field timestamp number Timestamp in milliseconds
---@field channelId string Channel identifier

---@class ChatMessage : IRCMessage
---@field type "message"

---@class SystemMessage : IRCMessage
---@field type "system"

---@class CommandMessage : IRCMessage
---@field type "command"

---@class JoinMessage : IRCMessage
---@field type "join"

---@class LeaveMessage : IRCMessage
---@field type "leave"

---@class InstallContext
---@field version string Version number

---@class InstallResult
---@field message string Installation message
---@field version? string Optional version number

---@class IRCWebchat
---@field on_install fun(context: InstallContext): InstallResult
---@field on_uninstall fun(): InstallResult
---@field formatTime fun(timestamp: number): string
---@field handleCommand fun(command: string, channelId: string, username: string, onlineUsers: string[]): IRCMessage
---@field sendMessage fun(channelId: string, username: string, userId: string, message: string): ChatMessage
---@field userJoin fun(channelId: string, username: string, userId: string): JoinMessage
---@field userLeave fun(channelId: string, username: string, userId: string): LeaveMessage

return {}
