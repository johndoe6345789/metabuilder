---@class TvChannel
---@field id string Channel ID
---@field channel_number number Channel number
---@field name string Channel name
---@field slug string URL slug
---@field description? string Description
---@field logo_url? string Logo URL
---@field category string Channel category
---@field is_live boolean Whether streaming
---@field viewer_count number Current viewers
---@field now_playing? TvProgram Current program
---@field hls_url? string HLS stream URL

---@class TvProgram
---@field id string Program ID
---@field title string Program title
---@field description? string Description
---@field category string Program category
---@field duration_seconds number Duration in seconds
---@field rating string Content rating

---@class TvScheduleEntry
---@field id string Entry ID
---@field program TvProgram Program info
---@field start_time string ISO timestamp
---@field end_time string ISO timestamp
---@field is_live boolean Whether live broadcast

---@class TvHelpersModule
---@field list_channels fun(tenant_id?: string): TvChannel[] List TV channels
---@field get_channel fun(channel_id: string): TvChannel|nil Get channel
---@field toggle_channel fun(channel_id: string): boolean, string? Start or stop channel
---@field get_schedule fun(channel_id: string, hours_ahead?: number): TvScheduleEntry[] Get schedule
---@field get_epg fun(hours_ahead?: number): table Get full EPG
---@field get_stream_url fun(channel_id: string, quality?: string): string|nil Get stream URL

-- Unified TV helpers module - combines channel, schedule, and formatting
local channels = require("lua.tv_channels")
local schedule = require("lua.tv_schedule")
local formatting = require("lua.tv_formatting")

local M = {}

-- Re-export channel functions
M.configure = channels.configure
M.list_channels = channels.list_channels
M.get_channel = channels.get_channel
M.toggle_channel = channels.toggle_channel
M.start_channel = channels.start_channel
M.stop_channel = channels.stop_channel
M.get_stream_url = channels.get_stream_url

-- Re-export schedule functions
M.get_schedule = schedule.get_schedule
M.get_epg = schedule.get_epg

-- Re-export formatting functions
M.format_duration = formatting.format_duration
M.format_epg_time = formatting.format_epg_time
M.get_category_name = formatting.get_category_name
M.get_rating_color = formatting.get_rating_color
M.format_viewer_count = formatting.format_viewer_count

return M
