--[[
  Libretro input handling
  Button presses, analog sticks, combos, and fighting game motions
]]

local constants = require("lua.retro_constants")

---@class RetroInputModule
local M = {}

-- Re-export constants for convenience
M.BUTTON = constants.BUTTON
M.AXIS = constants.AXIS

-- ============================================================================
-- Basic Input Functions
-- ============================================================================

---Press and release a button (tap)
---@param session_id string Session identifier
---@param button string Button from BUTTON table
---@param player? number Player number (default 0)
---@param duration_ms? number Hold duration in ms (default 50)
function M.tap(session_id, button, player, duration_ms)
    player = player or 0
    duration_ms = duration_ms or 50

    M.press(session_id, button, player)
    sleep(duration_ms)
    M.release(session_id, button, player)
end

---Press a button (hold down)
---@param session_id string Session identifier
---@param button string Button from BUTTON table
---@param player? number Player number (default 0)
function M.press(session_id, button, player)
    player = player or 0
    http.post("/api/v1/retro/sessions/" .. session_id .. "/input", {
        player = player,
        button = button,
        pressed = true
    })
end

---Release a button
---@param session_id string Session identifier
---@param button string Button from BUTTON table
---@param player? number Player number (default 0)
function M.release(session_id, button, player)
    player = player or 0
    http.post("/api/v1/retro/sessions/" .. session_id .. "/input", {
        player = player,
        button = button,
        pressed = false
    })
end

---Release all buttons for a player
---@param session_id string Session identifier
---@param player? number Player number (default 0)
function M.release_all(session_id, player)
    player = player or 0
    for _, btn in pairs(M.BUTTON) do
        M.release(session_id, btn, player)
    end
end

-- ============================================================================
-- Direction Shortcuts
-- ============================================================================

---Tap UP button
---@param session_id string Session identifier
---@param player? number Player number (default 0)
function M.up(session_id, player)
    M.tap(session_id, M.BUTTON.UP, player)
end

---Tap DOWN button
---@param session_id string Session identifier
---@param player? number Player number (default 0)
function M.down(session_id, player)
    M.tap(session_id, M.BUTTON.DOWN, player)
end

---Tap LEFT button
---@param session_id string Session identifier
---@param player? number Player number (default 0)
function M.left(session_id, player)
    M.tap(session_id, M.BUTTON.LEFT, player)
end

---Tap RIGHT button
---@param session_id string Session identifier
---@param player? number Player number (default 0)
function M.right(session_id, player)
    M.tap(session_id, M.BUTTON.RIGHT, player)
end

---Hold a direction
---@param session_id string Session identifier
---@param direction string "up", "down", "left", "right"
---@param duration_ms number How long to hold in milliseconds
---@param player? number Player number (default 0)
function M.hold_direction(session_id, direction, duration_ms, player)
    M.press(session_id, direction, player)
    sleep(duration_ms)
    M.release(session_id, direction, player)
end

---Move in a diagonal direction
---@param session_id string Session identifier
---@param horizontal string "left" or "right"
---@param vertical string "up" or "down"
---@param duration_ms? number Hold duration (default 50)
---@param player? number Player number (default 0)
function M.diagonal(session_id, horizontal, vertical, duration_ms, player)
    duration_ms = duration_ms or 50
    M.press(session_id, horizontal, player)
    M.press(session_id, vertical, player)
    sleep(duration_ms)
    M.release(session_id, horizontal, player)
    M.release(session_id, vertical, player)
end

-- ============================================================================
-- Analog Stick Input
-- ============================================================================

---Set analog stick position
---@param session_id string Session identifier
---@param stick string "left" or "right"
---@param x number -1.0 to 1.0 (left to right)
---@param y number -1.0 to 1.0 (up to down)
---@param player? number Player number (default 0)
function M.set_analog(session_id, stick, x, y, player)
    player = player or 0
    http.post("/api/v1/retro/sessions/" .. session_id .. "/input/analog", {
        player = player,
        stick = stick,
        x = math.max(-1.0, math.min(1.0, x)),
        y = math.max(-1.0, math.min(1.0, y))
    })
end

---Center (release) analog stick
---@param session_id string Session identifier
---@param stick string "left" or "right"
---@param player? number Player number (default 0)
function M.center_analog(session_id, stick, player)
    M.set_analog(session_id, stick, 0, 0, player)
end

---Move analog stick in a direction and return to center
---@param session_id string Session identifier
---@param stick string "left" or "right"
---@param x number -1.0 to 1.0 horizontal axis
---@param y number -1.0 to 1.0 vertical axis
---@param duration_ms? number How long to hold (default 100)
---@param player? number Player number (default 0)
function M.flick_analog(session_id, stick, x, y, duration_ms, player)
    duration_ms = duration_ms or 100
    M.set_analog(session_id, stick, x, y, player)
    sleep(duration_ms)
    M.center_analog(session_id, stick, player)
end

return M
