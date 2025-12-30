--[[
  Libretro/RetroArch helpers for retro gaming
  Provides Lua API for managing game sessions, save states, and streaming
]]

local retro_helpers = {}

--- @class LibretroCore
--- @field name string Core identifier
--- @field display_name string Human-readable name
--- @field system string System type (nes, snes, genesis, etc.)
--- @field supported_extensions string[] File extensions this core handles

--- @class RetroSessionConfig
--- @field rom_path string Path to the ROM file
--- @field core_name string Core to use
--- @field output_width? number Video width (default 1280)
--- @field output_height? number Video height (default 720)
--- @field shader_preset? string Shader to apply (crt-royale, etc.)
--- @field stream_url? string RTMP URL for streaming
--- @field netplay_enabled? boolean Enable netplay

--- @class RetroSessionState
--- @field session_id string
--- @field is_running boolean
--- @field is_paused boolean
--- @field rom_name string
--- @field core_name string
--- @field fps number Current FPS
--- @field frame_count number Total frames rendered
--- @field play_time number Seconds played

--- @class SaveState
--- @field state_id string
--- @field slot number Slot number (0-9)
--- @field created_at string ISO timestamp
--- @field screenshot_path string Path to screenshot
--- @field description string User description

-- System name mappings
retro_helpers.SYSTEMS = {
    -- Nintendo
    nes = { name = "Nintendo Entertainment System", cores = { "fceumm", "nestopia", "quicknes" } },
    snes = { name = "Super Nintendo", cores = { "snes9x", "bsnes", "snes9x2010" } },
    n64 = { name = "Nintendo 64", cores = { "mupen64plus_next", "parallel_n64" } },
    gb = { name = "Game Boy", cores = { "gambatte", "sameboy", "mgba" } },
    gbc = { name = "Game Boy Color", cores = { "gambatte", "sameboy", "mgba" } },
    gba = { name = "Game Boy Advance", cores = { "mgba", "vba_next", "gpsp" } },
    nds = { name = "Nintendo DS", cores = { "desmume", "melonds" } },
    
    -- Sega
    genesis = { name = "Sega Genesis", cores = { "genesis_plus_gx", "picodrive", "blastem" } },
    sms = { name = "Sega Master System", cores = { "genesis_plus_gx", "picodrive" } },
    gamegear = { name = "Sega Game Gear", cores = { "genesis_plus_gx" } },
    saturn = { name = "Sega Saturn", cores = { "mednafen_saturn", "yabause" } },
    dreamcast = { name = "Sega Dreamcast", cores = { "flycast" } },
    
    -- Sony
    psx = { name = "PlayStation", cores = { "mednafen_psx", "pcsx_rearmed", "swanstation" } },
    psp = { name = "PlayStation Portable", cores = { "ppsspp" } },
    
    -- Atari
    atari2600 = { name = "Atari 2600", cores = { "stella" } },
    atari7800 = { name = "Atari 7800", cores = { "prosystem" } },
    lynx = { name = "Atari Lynx", cores = { "handy", "mednafen_lynx" } },
    
    -- Other
    pce = { name = "PC Engine", cores = { "mednafen_pce", "mednafen_pce_fast" } },
    neogeo = { name = "Neo Geo", cores = { "fbneo", "fbalpha2012_neogeo" } },
    arcade = { name = "Arcade", cores = { "fbneo", "mame2003_plus", "mame" } },
    dos = { name = "DOS", cores = { "dosbox_pure", "dosbox_svn" } },
    scummvm = { name = "ScummVM", cores = { "scummvm" } },
}

-- Shader presets
retro_helpers.SHADERS = {
    none = "None (sharp pixels)",
    crt_royale = "CRT Royale (realistic CRT)",
    crt_lottes = "CRT Lottes (fast CRT)",
    crt_geom = "CRT Geom (geometry)",
    crt_aperture = "CRT Aperture",
    scanlines = "Scanlines (simple)",
    lcd_grid = "LCD Grid (handheld)",
    xbrz = "xBRZ (upscaling)",
    hqx = "HQx (upscaling)",
    bilinear = "Bilinear (smooth)",
}

--- Get available cores from the daemon
--- @return LibretroCore[]
function retro_helpers.get_available_cores()
    local response = http.get("/api/v1/retro/cores")
    if response.status == 200 then
        return response.json.cores
    end
    return {}
end

--- Get recommended core for a ROM file
--- @param rom_path string Path to the ROM
--- @return LibretroCore|nil
function retro_helpers.get_core_for_rom(rom_path)
    local response = http.post("/api/v1/retro/detect-core", {
        rom_path = rom_path
    })
    if response.status == 200 then
        return response.json.core
    end
    return nil
end

--- Start a new gaming session
--- @param config RetroSessionConfig
--- @return string|nil session_id
--- @return string|nil error
function retro_helpers.start_session(config)
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

--- Stop a gaming session
--- @param session_id string
--- @return boolean success
function retro_helpers.stop_session(session_id)
    local response = http.delete("/api/v1/retro/sessions/" .. session_id)
    return response.status == 200 or response.status == 204
end

--- Pause/resume a session
--- @param session_id string
--- @param paused boolean
--- @return boolean success
function retro_helpers.set_paused(session_id, paused)
    local response = http.patch("/api/v1/retro/sessions/" .. session_id, {
        paused = paused
    })
    return response.status == 200
end

--- Get session state
--- @param session_id string
--- @return RetroSessionState|nil
function retro_helpers.get_session_state(session_id)
    local response = http.get("/api/v1/retro/sessions/" .. session_id)
    if response.status == 200 then
        return response.json
    end
    return nil
end

--- List all active sessions
--- @return RetroSessionState[]
function retro_helpers.list_sessions()
    local response = http.get("/api/v1/retro/sessions")
    if response.status == 200 then
        return response.json.sessions
    end
    return {}
end

-- Save State Management

--- Create a save state
--- @param session_id string
--- @param slot? number Slot number (0-9), or -1 for auto
--- @param description? string Optional description
--- @return SaveState|nil
function retro_helpers.save_state(session_id, slot, description)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/states", {
        slot = slot or -1,
        description = description or ""
    })
    if response.status == 201 then
        return response.json
    end
    return nil
end

--- Load a save state
--- @param session_id string
--- @param slot number Slot number to load
--- @return boolean success
function retro_helpers.load_state(session_id, slot)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/states/" .. slot .. "/load")
    return response.status == 200
end

--- List save states for a session
--- @param session_id string
--- @return SaveState[]
function retro_helpers.list_save_states(session_id)
    local response = http.get("/api/v1/retro/sessions/" .. session_id .. "/states")
    if response.status == 200 then
        return response.json.states
    end
    return {}
end

--- Delete a save state
--- @param session_id string
--- @param state_id string
--- @return boolean success
function retro_helpers.delete_save_state(session_id, state_id)
    local response = http.delete("/api/v1/retro/sessions/" .. session_id .. "/states/" .. state_id)
    return response.status == 200 or response.status == 204
end

-- Input handling

--- Send button input
--- @param session_id string
--- @param player number Player number (0-3)
--- @param button string Button name (a, b, x, y, start, select, up, down, left, right, l, r)
--- @param pressed boolean True for press, false for release
function retro_helpers.send_input(session_id, player, button, pressed)
    http.post("/api/v1/retro/sessions/" .. session_id .. "/input", {
        player = player,
        button = button,
        pressed = pressed
    })
end

--- Send analog stick input
--- @param session_id string
--- @param player number
--- @param stick string "left" or "right"
--- @param x number -1.0 to 1.0
--- @param y number -1.0 to 1.0
function retro_helpers.send_analog(session_id, player, stick, x, y)
    http.post("/api/v1/retro/sessions/" .. session_id .. "/input/analog", {
        player = player,
        stick = stick,
        x = x,
        y = y
    })
end

-- Speed control

--- Set game speed multiplier
--- @param session_id string
--- @param speed number Speed multiplier (0.25 to 4.0)
function retro_helpers.set_speed(session_id, speed)
    http.patch("/api/v1/retro/sessions/" .. session_id, {
        speed = math.max(0.25, math.min(4.0, speed))
    })
end

--- Toggle fast forward
--- @param session_id string
--- @param enabled boolean
function retro_helpers.set_fast_forward(session_id, enabled)
    http.patch("/api/v1/retro/sessions/" .. session_id, {
        fast_forward = enabled
    })
end

--- Advance single frame (when paused)
--- @param session_id string
function retro_helpers.frame_advance(session_id)
    http.post("/api/v1/retro/sessions/" .. session_id .. "/frame-advance")
end

-- Screenshots and recording

--- Take a screenshot
--- @param session_id string
--- @return string|nil path Path to screenshot
function retro_helpers.take_screenshot(session_id)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/screenshot")
    if response.status == 201 then
        return response.json.path
    end
    return nil
end

--- Start recording gameplay
--- @param session_id string
--- @param output_path string Where to save the recording
--- @return boolean success
function retro_helpers.start_recording(session_id, output_path)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/recording/start", {
        output_path = output_path
    })
    return response.status == 200
end

--- Stop recording
--- @param session_id string
--- @return string|nil path Path to recording
function retro_helpers.stop_recording(session_id)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/recording/stop")
    if response.status == 200 then
        return response.json.path
    end
    return nil
end

-- Streaming

--- Start streaming to RTMP
--- @param session_id string
--- @param rtmp_url string RTMP ingest URL
--- @return boolean success
function retro_helpers.start_streaming(session_id, rtmp_url)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/stream/start", {
        rtmp_url = rtmp_url
    })
    return response.status == 200
end

--- Stop streaming
--- @param session_id string
--- @return boolean success
function retro_helpers.stop_streaming(session_id)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/stream/stop")
    return response.status == 200
end

-- Shaders

--- Set shader preset
--- @param session_id string
--- @param preset string Shader preset name
function retro_helpers.set_shader(session_id, preset)
    http.patch("/api/v1/retro/sessions/" .. session_id, {
        shader_preset = preset
    })
end

--- Get available shader presets
--- @return string[]
function retro_helpers.get_shaders()
    local response = http.get("/api/v1/retro/shaders")
    if response.status == 200 then
        return response.json.presets
    end
    return {}
end

-- Cheats

--- Load cheat codes
--- @param session_id string
--- @param codes string[] Array of cheat codes (Game Genie, Action Replay, etc.)
function retro_helpers.load_cheats(session_id, codes)
    http.post("/api/v1/retro/sessions/" .. session_id .. "/cheats", {
        codes = codes
    })
end

--- Enable/disable a cheat
--- @param session_id string
--- @param index number Cheat index
--- @param enabled boolean
function retro_helpers.set_cheat_enabled(session_id, index, enabled)
    http.patch("/api/v1/retro/sessions/" .. session_id .. "/cheats/" .. index, {
        enabled = enabled
    })
end

-- Netplay

--- Host a netplay session
--- @param session_id string
--- @param port number Port to listen on
--- @param password? string Optional password
--- @return string|nil room_code
function retro_helpers.host_netplay(session_id, port, password)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/netplay/host", {
        port = port,
        password = password
    })
    if response.status == 200 then
        return response.json.room_code
    end
    return nil
end

--- Join a netplay session
--- @param session_id string
--- @param host string Host address
--- @param port number Port
--- @param password? string
--- @return boolean success
function retro_helpers.join_netplay(session_id, host, port, password)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/netplay/join", {
        host = host,
        port = port,
        password = password
    })
    return response.status == 200
end

--- Disconnect from netplay
--- @param session_id string
function retro_helpers.disconnect_netplay(session_id)
    http.post("/api/v1/retro/sessions/" .. session_id .. "/netplay/disconnect")
end

-- RetroAchievements

--- Login to RetroAchievements
--- @param username string
--- @param password string
--- @return string|nil token
function retro_helpers.ra_login(username, password)
    local response = http.post("/api/v1/retro/retroachievements/login", {
        username = username,
        password = password
    })
    if response.status == 200 then
        return response.json.token
    end
    return nil
end

--- Get achievements for current game
--- @param session_id string
--- @return table[] achievements
function retro_helpers.get_achievements(session_id)
    local response = http.get("/api/v1/retro/sessions/" .. session_id .. "/achievements")
    if response.status == 200 then
        return response.json.achievements
    end
    return {}
end

-- Convenience functions

--- Quick start a game with auto-detected core
--- @param rom_path string
--- @param options? table Optional settings
--- @return string|nil session_id
function retro_helpers.quick_start(rom_path, options)
    options = options or {}
    
    local core = retro_helpers.get_core_for_rom(rom_path)
    if not core then
        return nil, "No compatible core found for ROM"
    end
    
    return retro_helpers.start_session({
        rom_path = rom_path,
        core_name = core.name,
        output_width = options.width or 1280,
        output_height = options.height or 720,
        shader_preset = options.shader,
        stream_url = options.stream_url,
        netplay_enabled = options.netplay or false
    })
end

--- Format play time as HH:MM:SS
--- @param seconds number
--- @return string
function retro_helpers.format_playtime(seconds)
    local hours = math.floor(seconds / 3600)
    local mins = math.floor((seconds % 3600) / 60)
    local secs = math.floor(seconds % 60)
    return string.format("%02d:%02d:%02d", hours, mins, secs)
end

return retro_helpers
