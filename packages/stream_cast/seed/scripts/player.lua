--- Stream player facade
--- Re-exports single-function modules for backward compatibility

---@type PlayerState
local PLAYING = "playing"
---@type PlayerState
local PAUSED = "paused"
---@type PlayerState
local BUFFERING = "buffering"
---@type PlayerState
local OFFLINE = "offline"

local M = {}

M.PLAYING = PLAYING
M.PAUSED = PAUSED
M.BUFFERING = BUFFERING
M.OFFLINE = OFFLINE

M.render = require("render_player")
M.render_controls = require("render_player_controls")
M.render_status = require("render_status")

return M
