--[[
  Libretro/RetroArch helpers for retro gaming
  Provides Lua API for managing game sessions, save states, and streaming

  This is a unified entry point that exports all retro functionality.
  Implementation is split into focused modules for maintainability.
]]

local constants = require("lua.retro_constants")
local input = require("lua.retro_input")
local combos = require("lua.retro_combos")
local session = require("lua.retro_session")
local save_state = require("lua.retro_save_state")
local media = require("lua.retro_media")
local features = require("lua.retro_features")

---@class RetroHelpersModule
local retro_helpers = {}

-- ============================================================================
-- Constants
-- ============================================================================

retro_helpers.BUTTON = constants.BUTTON
retro_helpers.AXIS = constants.AXIS
retro_helpers.SYSTEMS = constants.SYSTEMS
retro_helpers.SHADERS = constants.SHADERS

-- ============================================================================
-- Input Functions
-- ============================================================================

retro_helpers.tap = input.tap
retro_helpers.press = input.press
retro_helpers.release = input.release
retro_helpers.release_all = input.release_all
retro_helpers.up = input.up
retro_helpers.down = input.down
retro_helpers.left = input.left
retro_helpers.right = input.right
retro_helpers.hold_direction = input.hold_direction
retro_helpers.diagonal = input.diagonal
retro_helpers.set_analog = input.set_analog
retro_helpers.center_analog = input.center_analog
retro_helpers.flick_analog = input.flick_analog

-- ============================================================================
-- Combo/Motion Functions
-- ============================================================================

retro_helpers.combo = combos.combo
retro_helpers.MOTION = combos.MOTION
retro_helpers.special_move = combos.special_move

-- ============================================================================
-- Session Management
-- ============================================================================

retro_helpers.get_available_cores = session.get_available_cores
retro_helpers.get_core_for_rom = session.get_core_for_rom
retro_helpers.start_session = session.start_session
retro_helpers.stop_session = session.stop_session
retro_helpers.set_paused = session.set_paused
retro_helpers.get_session_state = session.get_session_state
retro_helpers.list_sessions = session.list_sessions
retro_helpers.set_speed = session.set_speed
retro_helpers.set_fast_forward = session.set_fast_forward
retro_helpers.frame_advance = session.frame_advance
retro_helpers.quick_start = session.quick_start
retro_helpers.format_playtime = session.format_playtime

-- ============================================================================
-- Save State Management
-- ============================================================================

retro_helpers.save_state = save_state.save_state
retro_helpers.load_state = save_state.load_state
retro_helpers.list_save_states = save_state.list_save_states
retro_helpers.delete_save_state = save_state.delete_save_state

-- ============================================================================
-- Media Capture
-- ============================================================================

retro_helpers.take_screenshot = media.take_screenshot
retro_helpers.start_recording = media.start_recording
retro_helpers.stop_recording = media.stop_recording
retro_helpers.start_streaming = media.start_streaming
retro_helpers.stop_streaming = media.stop_streaming

-- ============================================================================
-- Advanced Features
-- ============================================================================

retro_helpers.set_shader = features.set_shader
retro_helpers.get_shaders = features.get_shaders
retro_helpers.load_cheats = features.load_cheats
retro_helpers.set_cheat_enabled = features.set_cheat_enabled
retro_helpers.host_netplay = features.host_netplay
retro_helpers.join_netplay = features.join_netplay
retro_helpers.disconnect_netplay = features.disconnect_netplay
retro_helpers.ra_login = features.ra_login
retro_helpers.get_achievements = features.get_achievements

-- ============================================================================
-- Legacy Compatibility
-- ============================================================================

-- These functions were in the original but are now deprecated
-- in favor of direct input functions. Kept for backwards compatibility.

---Send button input (legacy)
---@param session_id string Session identifier
---@param player number Player number (0-3)
---@param button string Button name
---@param pressed boolean True for press, false for release
function retro_helpers.send_input(session_id, player, button, pressed)
    if pressed then
        input.press(session_id, button, player)
    else
        input.release(session_id, button, player)
    end
end

---Send analog stick input (legacy)
---@param session_id string Session identifier
---@param player number Player number (0-3)
---@param stick string "left" or "right"
---@param x number -1.0 to 1.0 horizontal axis
---@param y number -1.0 to 1.0 vertical axis
function retro_helpers.send_analog(session_id, player, stick, x, y)
    input.set_analog(session_id, stick, x, y, player)
end

return retro_helpers
