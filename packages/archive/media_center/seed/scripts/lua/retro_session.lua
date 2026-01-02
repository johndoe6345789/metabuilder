--[[
  Libretro session management
  Starting, stopping, and managing gaming sessions
]]

---@class RetroSessionModule
local M = {}

---Get available cores from the daemon
---@return LibretroCore[] cores List of available cores
function M.get_available_cores()
    local response = http.get("/api/v1/retro/cores")
    if response.status == 200 then
        return response.json.cores
    end
    return {}
end

---Get recommended core for a ROM file
---@param rom_path string Path to the ROM
---@return LibretroCore|nil core Recommended core or nil if none found
function M.get_core_for_rom(rom_path)
    local response = http.post("/api/v1/retro/detect-core", {
        rom_path = rom_path
    })
    if response.status == 200 then
        return response.json.core
    end
    return nil
end

---Start a new gaming session
---@param config RetroSessionConfig Session configuration
---@return string|nil session_id Session ID if successful
---@return string|nil error Error message if failed
function M.start_session(config)
    local response = http.post("/api/v1/retro/sessions", {
        rom_path = config.rom_path,
        core_name = config.core_name,
        output_width = config.output_width or 1280,
        output_height = config.output_height or 720,
        shader_preset = config.shader_preset,
        stream_url = config.stream_url,
        netplay_enabled = config.netplay_enabled or false
    })

    if response.status == 201 then
        return response.json.session_id, nil
    end
    return nil, response.json.error or "Failed to start session"
end

---Stop a gaming session
---@param session_id string Session identifier
---@return boolean success Whether stop was successful
function M.stop_session(session_id)
    local response = http.delete("/api/v1/retro/sessions/" .. session_id)
    return response.status == 200 or response.status == 204
end

---Pause or resume a session
---@param session_id string Session identifier
---@param paused boolean True to pause, false to resume
---@return boolean success Whether operation was successful
function M.set_paused(session_id, paused)
    local response = http.patch("/api/v1/retro/sessions/" .. session_id, {
        paused = paused
    })
    return response.status == 200
end

---Get session state
---@param session_id string Session identifier
---@return RetroSessionState|nil state Session state or nil if not found
function M.get_session_state(session_id)
    local response = http.get("/api/v1/retro/sessions/" .. session_id)
    if response.status == 200 then
        return response.json
    end
    return nil
end

---List all active sessions
---@return RetroSessionState[] sessions Array of active sessions
function M.list_sessions()
    local response = http.get("/api/v1/retro/sessions")
    if response.status == 200 then
        return response.json.sessions
    end
    return {}
end

---Set game speed multiplier
---@param session_id string Session identifier
---@param speed number Speed multiplier (0.25 to 4.0)
function M.set_speed(session_id, speed)
    http.patch("/api/v1/retro/sessions/" .. session_id, {
        speed = math.max(0.25, math.min(4.0, speed))
    })
end

---Toggle fast forward
---@param session_id string Session identifier
---@param enabled boolean True to enable, false to disable
function M.set_fast_forward(session_id, enabled)
    http.patch("/api/v1/retro/sessions/" .. session_id, {
        fast_forward = enabled
    })
end

---Advance single frame (when paused)
---@param session_id string Session identifier
function M.frame_advance(session_id)
    http.post("/api/v1/retro/sessions/" .. session_id .. "/frame-advance")
end

---Quick start a game with auto-detected core
---@param rom_path string Path to ROM file
---@param options? QuickStartOptions Optional configuration settings
---@return string|nil session_id Session ID if successful
---@return string|nil error Error message if failed
function M.quick_start(rom_path, options)
    options = options or {}

    local core = M.get_core_for_rom(rom_path)
    if not core then
        return nil, "No compatible core found for ROM"
    end

    return M.start_session({
        rom_path = rom_path,
        core_name = core.name,
        output_width = options.width or 1280,
        output_height = options.height or 720,
        shader_preset = options.shader,
        stream_url = options.stream_url,
        netplay_enabled = options.netplay or false
    })
end

---Format play time as HH:MM:SS
---@param seconds number Total seconds played
---@return string formatted Formatted time string
function M.format_playtime(seconds)
    local hours = math.floor(seconds / 3600)
    local mins = math.floor((seconds % 3600) / 60)
    local secs = math.floor(seconds % 60)
    return string.format("%02d:%02d:%02d", hours, mins, secs)
end

return M
