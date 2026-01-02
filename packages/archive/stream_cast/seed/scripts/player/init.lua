--- Stream player sub-module
--- Provides controls and overlay components
---@class StreamPlayerSubModule
---@field controls fun(show_play?: boolean, show_volume?: boolean, show_fullscreen?: boolean): PlayerControlsConfig
---@field overlay fun(title: string, subtitle: string): PlayerOverlayComponent

local player = {
  controls = require("player.controls"),
  overlay = require("player.overlay")
}

return player
