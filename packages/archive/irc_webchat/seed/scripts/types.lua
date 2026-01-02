---@meta
-- Type definitions for irc_webchat package
-- Provides types for IRC-style web chat, channels, and real-time messaging

--------------------------------------------------------------------------------
-- Enums and Aliases
--------------------------------------------------------------------------------

---@alias MessageType
---| "message" Regular chat message
---| "system" System announcement
---| "command" Slash command
---| "join" User joined channel
---| "leave" User left channel
---| "action" /me action message
---| "notice" Server notice
---| "topic" Topic change
---| "mode" Mode change

---@alias ConnectionState
---| "disconnected" Not connected
---| "connecting" Attempting connection
---| "connected" Successfully connected
---| "reconnecting" Lost connection, attempting reconnect
---| "error" Connection error

---@alias ChannelMode
---| "public" Anyone can join
---| "private" Invite only
---| "moderated" Only ops can speak
---| "secret" Channel hidden from list

---@alias UserRole
---| "owner" Channel owner (~)
---| "admin" Channel admin (&)
---| "op" Channel operator (@)
---| "halfop" Half operator (%)
---| "voice" Voiced user (+)
---| "user" Regular user

---@alias PresenceStatus
---| "online" User is online
---| "away" User is away
---| "busy" User is busy/DND
---| "offline" User is offline

--------------------------------------------------------------------------------
-- Message Types
--------------------------------------------------------------------------------

---@class IRCMessage
---@field id string Unique message identifier (UUID)
---@field username string Display name of sender
---@field userId string User identifier
---@field message string Message content
---@field type MessageType Message type
---@field timestamp number Timestamp in milliseconds
---@field channelId string Channel identifier
---@field formatted? string Pre-formatted message with colors/styles
---@field mentions? string[] Mentioned user IDs
---@field raw? string Raw IRC protocol message

---@class ChatMessage : IRCMessage
---@field type "message"
---@field reply_to? string Message ID being replied to

---@class SystemMessage : IRCMessage
---@field type "system"
---@field code? string System message code

---@class CommandMessage : IRCMessage
---@field type "command"
---@field command string Command name
---@field args string[] Command arguments

---@class JoinMessage : IRCMessage
---@field type "join"
---@field join_count? number User's join count for channel

---@class LeaveMessage : IRCMessage
---@field type "leave"
---@field reason? string Leave reason/message

---@class ActionMessage : IRCMessage
---@field type "action"

---@class TopicMessage : IRCMessage
---@field type "topic"
---@field old_topic? string Previous topic
---@field new_topic string New topic

---@class ModeMessage : IRCMessage
---@field type "mode"
---@field mode_changes string Mode string (e.g., "+o user")
---@field target? string Target user/channel

--------------------------------------------------------------------------------
-- User and Presence Types
--------------------------------------------------------------------------------

---@class ChatUser
---@field id string User ID
---@field username string Display name
---@field nickname? string IRC nickname (if different)
---@field avatar? string Avatar URL
---@field role UserRole User role in channel
---@field status PresenceStatus Presence status
---@field status_message? string Custom status message
---@field joined_at number Join timestamp
---@field last_active number Last activity timestamp
---@field is_typing? boolean Whether user is typing
---@field badges? string[] Special badges

---@class UserPresence
---@field user_id string User ID
---@field channel_id string Channel ID
---@field status PresenceStatus Status
---@field last_seen number Last seen timestamp
---@field typing_until? number Typing indicator expiry

---@class TypingIndicator
---@field user_id string User who is typing
---@field channel_id string Channel
---@field started_at number When typing started
---@field expires_at number When indicator expires

--------------------------------------------------------------------------------
-- Channel Types
--------------------------------------------------------------------------------

---@class Channel
---@field id string Channel identifier
---@field name string Channel name (with #)
---@field topic? string Channel topic
---@field topic_set_by? string Who set the topic
---@field topic_set_at? number When topic was set
---@field mode ChannelMode Channel mode
---@field modes string[] Active mode flags
---@field created_at number Creation timestamp
---@field user_count number Number of users
---@field message_count? number Total messages
---@field password_protected boolean Requires password

---@class ChannelState
---@field channel Channel Channel info
---@field users ChatUser[] Users in channel
---@field messages IRCMessage[] Recent messages
---@field scroll_position? number Scroll position
---@field has_more_history boolean Whether more history available
---@field unread_count number Unread messages
---@field mentions_count number Unread mentions
---@field last_read_id? string Last read message ID

---@class ChannelListItem
---@field id string Channel ID
---@field name string Channel name
---@field topic? string Topic preview
---@field user_count number User count
---@field mode ChannelMode Channel mode

--------------------------------------------------------------------------------
-- Connection Types
--------------------------------------------------------------------------------

---@class ConnectionConfig
---@field server string Server hostname
---@field port number Server port (default 6667)
---@field ssl boolean Use SSL/TLS
---@field nickname string Desired nickname
---@field username? string Username (ident)
---@field realname? string Real name
---@field password? string Server password
---@field channels? string[] Auto-join channels
---@field reconnect boolean Auto-reconnect on disconnect
---@field reconnect_delay number Reconnect delay in ms
---@field max_reconnect_attempts number Max reconnect attempts

---@class ConnectionStatus
---@field state ConnectionState Current state
---@field server? string Connected server
---@field nick? string Current nickname
---@field connected_at? number Connection timestamp
---@field latency? number Ping latency in ms
---@field error? string Error message if state is error
---@field reconnect_attempt? number Current reconnect attempt

--------------------------------------------------------------------------------
-- Command Types
--------------------------------------------------------------------------------

---@class CommandDefinition
---@field name string Command name (without /)
---@field description string Command description
---@field usage string Usage syntax
---@field args_min number Minimum arguments
---@field args_max number Maximum arguments (-1 = unlimited)
---@field op_required boolean Requires operator status
---@field handler string Handler function name

---@class CommandResult
---@field success boolean Whether command succeeded
---@field message? IRCMessage Result message to display
---@field error? string Error message
---@field silent? boolean Don't display result

---@class ParsedCommand
---@field command string Command name
---@field args string[] Arguments
---@field raw string Raw input
---@field target? string Target user/channel (for some commands)

--------------------------------------------------------------------------------
-- Install and Lifecycle Types
--------------------------------------------------------------------------------

---@class InstallContext
---@field version string Version being installed
---@field previous_version? string Previously installed version
---@field config? table Installation configuration

---@class InstallResult
---@field message string Status message
---@field version? string Installed version
---@field success boolean Whether install succeeded
---@field errors? string[] Error messages

---@class UninstallResult
---@field message string Status message
---@field success boolean Whether uninstall succeeded
---@field cleanup_performed boolean Whether cleanup was done

--------------------------------------------------------------------------------
-- UI Component Types
--------------------------------------------------------------------------------

---@class ChatWindowComponent
---@field type "Box" Component type
---@field props ChatWindowProps Window properties
---@field children table[] Child components

---@class ChatWindowProps
---@field channel_id string Channel ID
---@field height string Window height
---@field show_user_list boolean Show user list sidebar

---@class MessageListComponent
---@field type "Stack" Component type
---@field children MessageComponent[] Message components

---@class MessageComponent
---@field type "ChatMessage" Component type
---@field props MessageComponentProps Message properties

---@class MessageComponentProps
---@field id string Message ID
---@field username string Sender name
---@field content string Message content
---@field timestamp string Formatted timestamp
---@field type MessageType Message type
---@field avatar? string Avatar URL
---@field role? UserRole User role badge

---@class UserListComponent
---@field type "Box" Component type
---@field props UserListProps List properties
---@field children UserListItem[] User items

---@class UserListProps
---@field channel_id string Channel ID
---@field show_status boolean Show status indicators

---@class UserListItem
---@field type "UserItem" Component type
---@field props UserItemProps User properties

---@class UserItemProps
---@field user_id string User ID
---@field username string Display name
---@field role UserRole User role
---@field status PresenceStatus Presence status
---@field avatar? string Avatar URL

---@class InputBarComponent
---@field type "Box" Component type
---@field props InputBarProps Input properties

---@class InputBarProps
---@field channel_id string Channel ID
---@field placeholder string Input placeholder
---@field max_length number Max message length
---@field show_emoji_picker boolean Show emoji button
---@field show_file_upload boolean Show upload button

--------------------------------------------------------------------------------
-- Module Interface
--------------------------------------------------------------------------------

---@class IRCWebchat
---@field on_install fun(context: InstallContext): InstallResult Installation handler
---@field on_uninstall fun(): UninstallResult Uninstallation handler
---@field connect fun(config: ConnectionConfig): ConnectionStatus Connect to server
---@field disconnect fun(message?: string): boolean Disconnect from server
---@field get_status fun(): ConnectionStatus Get connection status
---@field join_channel fun(channel: string, password?: string): ChannelState Join a channel
---@field leave_channel fun(channel: string, message?: string): boolean Leave a channel
---@field get_channel fun(channel_id: string): ChannelState|nil Get channel state
---@field get_channels fun(): ChannelListItem[] List joined channels
---@field list_channels fun(filter?: string): ChannelListItem[] List available channels
---@field get_users fun(channel_id: string): ChatUser[] Get users in channel
---@field sendMessage fun(channelId: string, username: string, userId: string, message: string): ChatMessage Send a message
---@field userJoin fun(channelId: string, username: string, userId: string): JoinMessage Handle user join
---@field userLeave fun(channelId: string, username: string, userId: string): LeaveMessage Handle user leave
---@field handleCommand fun(command: string, channelId: string, username: string, onlineUsers: string[]): IRCMessage Process slash command
---@field parse_command fun(input: string): ParsedCommand|nil Parse command from input
---@field get_commands fun(): CommandDefinition[] Get available commands
---@field set_topic fun(channel_id: string, topic: string): TopicMessage|nil Set channel topic
---@field set_mode fun(channel_id: string, mode: string, target?: string): ModeMessage|nil Set channel/user mode
---@field kick_user fun(channel_id: string, user_id: string, reason?: string): boolean Kick user from channel
---@field ban_user fun(channel_id: string, user_id: string, reason?: string): boolean Ban user from channel
---@field unban_user fun(channel_id: string, user_id: string): boolean Unban user
---@field get_history fun(channel_id: string, before?: string, limit?: number): IRCMessage[] Get message history
---@field set_presence fun(status: PresenceStatus, message?: string): boolean Set presence status
---@field start_typing fun(channel_id: string): boolean Send typing indicator
---@field stop_typing fun(channel_id: string): boolean Stop typing indicator
---@field formatTime fun(timestamp: number): string Format timestamp for display
---@field build_chat_window fun(channel: ChannelState): ChatWindowComponent Build chat window UI
---@field build_message_list fun(messages: IRCMessage[]): MessageListComponent Build message list UI
---@field build_user_list fun(users: ChatUser[]): UserListComponent Build user list UI

return {}
