--- Stream scheduling facade
--- Re-exports single-function modules for backward compatibility
---@module schedule

---@class ScheduleModule
---@field render_item fun(item: table): string Render schedule item
---@field render_list fun(items: table[]): string Render schedule list
---@field create fun(stream: table): string Schedule new stream
---@field cancel fun(stream_id: string): boolean Cancel scheduled stream
local M = {}

M.render_item = require("render_schedule_item")
M.render_list = require("render_schedule_list")
M.create = require("schedule_stream")
M.cancel = require("cancel_stream")

return M
