--[[
  Libretro combo and motion inputs
  Complex input sequences and fighting game motions
]]

local input = require("lua.retro_input")

---@class RetroCombosModule
local M = {}

-- ============================================================================
-- Combo/Macro System
-- ============================================================================

---Execute a sequence of inputs
---@param session_id string Session identifier
---@param inputs ComboInput[] Array of input specifications
---@param player? number Player number (default 0)
function M.combo(session_id, inputs, player)
    for _, input_spec in ipairs(inputs) do
        if input_spec.button then
            input.tap(session_id, input_spec.button, player, input_spec.duration_ms)
        elseif input_spec.analog then
            input.flick_analog(session_id, input_spec.analog.stick,
                input_spec.analog.x, input_spec.analog.y, input_spec.duration_ms, player)
        end
        if input_spec.wait_after_ms then
            sleep(input_spec.wait_after_ms)
        end
    end
end

-- ============================================================================
-- Fighting Game Motions
-- ============================================================================

--- Common fighting game motions
M.MOTION = {
    -- Quarter circle forward (↓↘→)
    QCF = function(session_id, player)
        input.tap(session_id, "down", player, 30)
        input.diagonal(session_id, "right", "down", 30, player)
        input.tap(session_id, "right", player, 30)
    end,

    -- Quarter circle back (↓↙←)
    QCB = function(session_id, player)
        input.tap(session_id, "down", player, 30)
        input.diagonal(session_id, "left", "down", 30, player)
        input.tap(session_id, "left", player, 30)
    end,

    -- Dragon punch / Shoryuken (→↓↘)
    DP = function(session_id, player)
        input.tap(session_id, "right", player, 30)
        input.tap(session_id, "down", player, 30)
        input.diagonal(session_id, "right", "down", 30, player)
    end,

    -- Half circle forward (←↙↓↘→)
    HCF = function(session_id, player)
        input.tap(session_id, "left", player, 30)
        input.diagonal(session_id, "left", "down", 30, player)
        input.tap(session_id, "down", player, 30)
        input.diagonal(session_id, "right", "down", 30, player)
        input.tap(session_id, "right", player, 30)
    end,

    -- Charge back then forward
    CHARGE_BF = function(session_id, charge_ms, player)
        charge_ms = charge_ms or 800
        input.hold_direction(session_id, "left", charge_ms, player)
        input.tap(session_id, "right", player, 30)
    end,

    -- 360 motion (for grapplers)
    CIRCLE = function(session_id, player)
        local dirs = {"right", "down", "left", "up"}
        for _, dir in ipairs(dirs) do
            input.tap(session_id, dir, player, 20)
        end
    end,
}

---Execute a motion then press a button
---@param session_id string Session identifier
---@param motion function Motion from MOTION table
---@param button string Button to press after motion
---@param player? number Player number (default 0)
function M.special_move(session_id, motion, button, player)
    motion(session_id, player)
    input.tap(session_id, button, player)
end

return M
