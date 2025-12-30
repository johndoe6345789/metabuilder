--[[
  Libretro/RetroArch helpers for retro gaming
  Provides Lua API for managing game sessions, save states, and streaming
]]

---@class RetroHelpersModule
---@field BUTTON table<string, string> Button constants matching libretro RETRO_DEVICE_ID_JOYPAD_*
---@field AXIS table<string, string> Analog stick axis identifiers
---@field MOTION table<string, function> Common fighting game motion inputs
---@field SYSTEMS table<string, SystemInfo> System name mappings and core information
---@field SHADERS table<string, string> Available shader preset descriptions
---@field tap fun(session_id: string, button: string, player?: number, duration_ms?: number) Press and release a button
---@field press fun(session_id: string, button: string, player?: number) Press a button (hold down)
---@field release fun(session_id: string, button: string, player?: number) Release a button
---@field release_all fun(session_id: string, player?: number) Release all buttons for a player
---@field up fun(session_id: string, player?: number) Tap UP button
---@field down fun(session_id: string, player?: number) Tap DOWN button
---@field left fun(session_id: string, player?: number) Tap LEFT button
---@field right fun(session_id: string, player?: number) Tap RIGHT button
---@field hold_direction fun(session_id: string, direction: string, duration_ms: number, player?: number) Hold a direction
---@field diagonal fun(session_id: string, horizontal: string, vertical: string, duration_ms?: number, player?: number) Move in a diagonal direction
---@field set_analog fun(session_id: string, stick: string, x: number, y: number, player?: number) Set analog stick position
---@field center_analog fun(session_id: string, stick: string, player?: number) Center (release) analog stick
---@field flick_analog fun(session_id: string, stick: string, x: number, y: number, duration_ms?: number, player?: number) Move analog stick and return to center
---@field combo fun(session_id: string, inputs: ComboInput[], player?: number) Execute a sequence of inputs
---@field special_move fun(session_id: string, motion: function, button: string, player?: number) Execute a motion then press a button
---@field get_available_cores fun(): LibretroCore[] Get available cores from the daemon
---@field get_core_for_rom fun(rom_path: string): LibretroCore|nil Get recommended core for a ROM file
---@field start_session fun(config: RetroSessionConfig): string|nil, string? Start a new gaming session
---@field stop_session fun(session_id: string): boolean Stop a gaming session
---@field set_paused fun(session_id: string, paused: boolean): boolean Pause/resume a session
---@field get_session_state fun(session_id: string): RetroSessionState|nil Get session state
---@field list_sessions fun(): RetroSessionState[] List all active sessions
---@field save_state fun(session_id: string, slot?: number, description?: string): SaveState|nil Create a save state
---@field load_state fun(session_id: string, slot: number): boolean Load a save state
---@field list_save_states fun(session_id: string): SaveState[] List save states for a session
---@field delete_save_state fun(session_id: string, state_id: string): boolean Delete a save state
---@field send_input fun(session_id: string, player: number, button: string, pressed: boolean) Send button input
---@field send_analog fun(session_id: string, player: number, stick: string, x: number, y: number) Send analog stick input
---@field set_speed fun(session_id: string, speed: number) Set game speed multiplier
---@field set_fast_forward fun(session_id: string, enabled: boolean) Toggle fast forward
---@field frame_advance fun(session_id: string) Advance single frame (when paused)
---@field take_screenshot fun(session_id: string): string|nil Take a screenshot
---@field start_recording fun(session_id: string, output_path: string): boolean Start recording gameplay
---@field stop_recording fun(session_id: string): string|nil Stop recording
---@field start_streaming fun(session_id: string, rtmp_url: string): boolean Start streaming to RTMP
---@field stop_streaming fun(session_id: string): boolean Stop streaming
---@field set_shader fun(session_id: string, preset: string) Set shader preset
---@field get_shaders fun(): string[] Get available shader presets
---@field load_cheats fun(session_id: string, codes: string[]) Load cheat codes
---@field set_cheat_enabled fun(session_id: string, index: number, enabled: boolean) Enable/disable a cheat
---@field host_netplay fun(session_id: string, port: number, password?: string): string|nil Host a netplay session
---@field join_netplay fun(session_id: string, host: string, port: number, password?: string): boolean Join a netplay session
---@field disconnect_netplay fun(session_id: string) Disconnect from netplay
---@field ra_login fun(username: string, password: string): string|nil Login to RetroAchievements
---@field get_achievements fun(session_id: string): Achievement[] Get achievements for current game
---@field quick_start fun(rom_path: string, options?: QuickStartOptions): string|nil, string? Quick start a game with auto-detected core
---@field format_playtime fun(seconds: number): string Format play time as HH:MM:SS
local retro_helpers = {}

-- ============================================================================
-- Button Constants (matches libretro RETRO_DEVICE_ID_JOYPAD_*)
-- ============================================================================

retro_helpers.BUTTON = {
    -- D-Pad
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right",
    
    -- Face buttons (SNES layout)
    A = "a",
    B = "b",
    X = "x",
    Y = "y",
    
    -- Shoulder buttons
    L = "l",
    R = "r",
    L2 = "l2",
    R2 = "r2",
    L3 = "l3",      -- Left stick click
    R3 = "r3",      -- Right stick click
    
    -- Menu buttons
    START = "start",
    SELECT = "select",
}

-- Aliases for different console naming conventions
retro_helpers.BUTTON.CROSS = retro_helpers.BUTTON.B      -- PlayStation
retro_helpers.BUTTON.CIRCLE = retro_helpers.BUTTON.A    -- PlayStation
retro_helpers.BUTTON.SQUARE = retro_helpers.BUTTON.Y    -- PlayStation
retro_helpers.BUTTON.TRIANGLE = retro_helpers.BUTTON.X  -- PlayStation
retro_helpers.BUTTON.RUN = retro_helpers.BUTTON.START   -- PC Engine
retro_helpers.BUTTON.OPTION = retro_helpers.BUTTON.SELECT -- Atari

-- Analog stick axes
retro_helpers.AXIS = {
    LEFT_X = "left_x",
    LEFT_Y = "left_y",
    RIGHT_X = "right_x",
    RIGHT_Y = "right_y",
}

-- ============================================================================
-- Input Functions
-- ============================================================================

---Press and release a button (tap)
---@param session_id string Session identifier
---@param button string Button from BUTTON table
---@param player? number Player number (default 0)
---@param duration_ms? number Hold duration in ms (default 50)
function retro_helpers.tap(session_id, button, player, duration_ms)
    player = player or 0
    duration_ms = duration_ms or 50
    
    retro_helpers.press(session_id, button, player)
    sleep(duration_ms)
    retro_helpers.release(session_id, button, player)
end

---Press a button (hold down)
---@param session_id string Session identifier
---@param button string Button from BUTTON table
---@param player? number Player number (default 0)
function retro_helpers.press(session_id, button, player)
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
function retro_helpers.release(session_id, button, player)
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
function retro_helpers.release_all(session_id, player)
    player = player or 0
    for _, btn in pairs(retro_helpers.BUTTON) do
        retro_helpers.release(session_id, btn, player)
    end
end

-- Convenience functions for directions

---Tap UP button
---@param session_id string Session identifier
---@param player? number Player number (default 0)
function retro_helpers.up(session_id, player)
    retro_helpers.tap(session_id, retro_helpers.BUTTON.UP, player)
end

---Tap DOWN button
---@param session_id string Session identifier
---@param player? number Player number (default 0)
function retro_helpers.down(session_id, player)
    retro_helpers.tap(session_id, retro_helpers.BUTTON.DOWN, player)
end

---Tap LEFT button
---@param session_id string Session identifier
---@param player? number Player number (default 0)
function retro_helpers.left(session_id, player)
    retro_helpers.tap(session_id, retro_helpers.BUTTON.LEFT, player)
end

---Tap RIGHT button
---@param session_id string Session identifier
---@param player? number Player number (default 0)
function retro_helpers.right(session_id, player)
    retro_helpers.tap(session_id, retro_helpers.BUTTON.RIGHT, player)
end

---Hold a direction
---@param session_id string Session identifier
---@param direction string "up", "down", "left", "right"
---@param duration_ms number How long to hold in milliseconds
---@param player? number Player number (default 0)
function retro_helpers.hold_direction(session_id, direction, duration_ms, player)
    retro_helpers.press(session_id, direction, player)
    sleep(duration_ms)
    retro_helpers.release(session_id, direction, player)
end

---Move in a diagonal direction
---@param session_id string Session identifier
---@param horizontal string "left" or "right"
---@param vertical string "up" or "down"
---@param duration_ms? number Hold duration (default 50)
---@param player? number Player number (default 0)
function retro_helpers.diagonal(session_id, horizontal, vertical, duration_ms, player)
    duration_ms = duration_ms or 50
    retro_helpers.press(session_id, horizontal, player)
    retro_helpers.press(session_id, vertical, player)
    sleep(duration_ms)
    retro_helpers.release(session_id, horizontal, player)
    retro_helpers.release(session_id, vertical, player)
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
function retro_helpers.set_analog(session_id, stick, x, y, player)
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
function retro_helpers.center_analog(session_id, stick, player)
    retro_helpers.set_analog(session_id, stick, 0, 0, player)
end

---Move analog stick in a direction and return to center
---@param session_id string Session identifier
---@param stick string "left" or "right"
---@param x number -1.0 to 1.0 horizontal axis
---@param y number -1.0 to 1.0 vertical axis
---@param duration_ms? number How long to hold (default 100)
---@param player? number Player number (default 0)
function retro_helpers.flick_analog(session_id, stick, x, y, duration_ms, player)
    duration_ms = duration_ms or 100
    retro_helpers.set_analog(session_id, stick, x, y, player)
    sleep(duration_ms)
    retro_helpers.center_analog(session_id, stick, player)
end

-- ============================================================================
-- Combo/Macro System
-- ============================================================================

---Execute a sequence of inputs
---@param session_id string Session identifier
---@param inputs ComboInput[] Array of input specifications
---@param player? number Player number (default 0)
function retro_helpers.combo(session_id, inputs, player)
    for _, input in ipairs(inputs) do
        if input.button then
            retro_helpers.tap(session_id, input.button, player, input.duration_ms)
        elseif input.analog then
            retro_helpers.flick_analog(session_id, input.analog.stick, 
                input.analog.x, input.analog.y, input.duration_ms, player)
        end
        if input.wait_after_ms then
            sleep(input.wait_after_ms)
        end
    end
end

--- Common fighting game motions
retro_helpers.MOTION = {
    -- Quarter circle forward (↓↘→)
    QCF = function(session_id, player)
        retro_helpers.tap(session_id, "down", player, 30)
        retro_helpers.diagonal(session_id, "right", "down", 30, player)
        retro_helpers.tap(session_id, "right", player, 30)
    end,
    
    -- Quarter circle back (↓↙←)
    QCB = function(session_id, player)
        retro_helpers.tap(session_id, "down", player, 30)
        retro_helpers.diagonal(session_id, "left", "down", 30, player)
        retro_helpers.tap(session_id, "left", player, 30)
    end,
    
    -- Dragon punch / Shoryuken (→↓↘)
    DP = function(session_id, player)
        retro_helpers.tap(session_id, "right", player, 30)
        retro_helpers.tap(session_id, "down", player, 30)
        retro_helpers.diagonal(session_id, "right", "down", 30, player)
    end,
    
    -- Half circle forward (←↙↓↘→)
    HCF = function(session_id, player)
        retro_helpers.tap(session_id, "left", player, 30)
        retro_helpers.diagonal(session_id, "left", "down", 30, player)
        retro_helpers.tap(session_id, "down", player, 30)
        retro_helpers.diagonal(session_id, "right", "down", 30, player)
        retro_helpers.tap(session_id, "right", player, 30)
    end,
    
    -- Charge back then forward
    CHARGE_BF = function(session_id, charge_ms, player)
        charge_ms = charge_ms or 800
        retro_helpers.hold_direction(session_id, "left", charge_ms, player)
        retro_helpers.tap(session_id, "right", player, 30)
    end,
    
    -- 360 motion (for grapplers)
    CIRCLE = function(session_id, player)
        local dirs = {"right", "down", "left", "up"}
        for _, dir in ipairs(dirs) do
            retro_helpers.tap(session_id, dir, player, 20)
        end
    end,
}

---Execute a motion then press a button
---@param session_id string Session identifier
---@param motion function Motion from MOTION table
---@param button string Button to press after motion
---@param player? number Player number (default 0)
function retro_helpers.special_move(session_id, motion, button, player)
    motion(session_id, player)
    retro_helpers.tap(session_id, button, player)
end

-- ============================================================================
-- Type Definitions
-- ============================================================================

---@class LibretroCore
---@field name string Core identifier
---@field display_name string Human-readable name
---@field system string System type (nes, snes, genesis, etc.)
---@field supported_extensions string[] File extensions this core handles

---@class RetroSessionConfig
---@field rom_path string Path to the ROM file
---@field core_name string Core to use
---@field output_width? number Video width (default 1280)
---@field output_height? number Video height (default 720)
---@field shader_preset? string Shader to apply (crt-royale, etc.)
---@field stream_url? string RTMP URL for streaming
---@field netplay_enabled? boolean Enable netplay

---@class RetroSessionState
---@field session_id string Unique session identifier
---@field is_running boolean Whether session is active
---@field is_paused boolean Whether session is paused
---@field rom_name string Name of ROM file
---@field core_name string Name of libretro core
---@field fps number Current frames per second
---@field frame_count number Total frames rendered
---@field play_time number Seconds played

---@class SaveState
---@field state_id string Unique state identifier
---@field slot number Slot number (0-9)
---@field created_at string ISO timestamp
---@field screenshot_path string Path to screenshot
---@field description string User description

---@class ComboInput
---@field button? string Button to press
---@field analog? AnalogInput Analog stick input
---@field duration_ms? number How long to hold the input
---@field wait_after_ms? number Wait time after this input

---@class AnalogInput
---@field stick string Stick identifier ("left" or "right")
---@field x number Horizontal axis value (-1.0 to 1.0)
---@field y number Vertical axis value (-1.0 to 1.0)

---@class SystemInfo
---@field name string Full system name
---@field cores string[] List of compatible core names

---@class Achievement
---@field id string Achievement ID
---@field title string Achievement title
---@field description string Achievement description
---@field points number Points value
---@field unlocked boolean Whether unlocked
---@field unlock_time? string ISO timestamp when unlocked

---@class QuickStartOptions
---@field width? number Video width
---@field height? number Video height
---@field shader? string Shader preset name
---@field stream_url? string RTMP streaming URL
---@field netplay? boolean Enable netplay

---@class HTTPResponse
---@field status number HTTP status code
---@field json table Parsed JSON response body

-- ============================================================================
-- System Definitions
-- ============================================================================

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

---Get available cores from the daemon
---@return LibretroCore[] cores List of available cores
function retro_helpers.get_available_cores()
    local response = http.get("/api/v1/retro/cores")
    if response.status == 200 then
        return response.json.cores
    end
    return {}
end

---Get recommended core for a ROM file
---@param rom_path string Path to the ROM
---@return LibretroCore|nil core Recommended core or nil if none found
function retro_helpers.get_core_for_rom(rom_path)
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

---Stop a gaming session
---@param session_id string Session identifier
---@return boolean success Whether stop was successful
function retro_helpers.stop_session(session_id)
    local response = http.delete("/api/v1/retro/sessions/" .. session_id)
    return response.status == 200 or response.status == 204
end

---Pause or resume a session
---@param session_id string Session identifier
---@param paused boolean True to pause, false to resume
---@return boolean success Whether operation was successful
function retro_helpers.set_paused(session_id, paused)
    local response = http.patch("/api/v1/retro/sessions/" .. session_id, {
        paused = paused
    })
    return response.status == 200
end

---Get session state
---@param session_id string Session identifier
---@return RetroSessionState|nil state Session state or nil if not found
function retro_helpers.get_session_state(session_id)
    local response = http.get("/api/v1/retro/sessions/" .. session_id)
    if response.status == 200 then
        return response.json
    end
    return nil
end

---List all active sessions
---@return RetroSessionState[] sessions Array of active sessions
function retro_helpers.list_sessions()
    local response = http.get("/api/v1/retro/sessions")
    if response.status == 200 then
        return response.json.sessions
    end
    return {}
end

-- Save State Management

---Create a save state
---@param session_id string Session identifier
---@param slot? number Slot number (0-9), or -1 for auto
---@param description? string Optional description
---@return SaveState|nil state Save state info or nil if failed
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

---Load a save state
---@param session_id string Session identifier
---@param slot number Slot number to load
---@return boolean success Whether load was successful
function retro_helpers.load_state(session_id, slot)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/states/" .. slot .. "/load")
    return response.status == 200
end

---List save states for a session
---@param session_id string Session identifier
---@return SaveState[] states Array of save states
function retro_helpers.list_save_states(session_id)
    local response = http.get("/api/v1/retro/sessions/" .. session_id .. "/states")
    if response.status == 200 then
        return response.json.states
    end
    return {}
end

---Delete a save state
---@param session_id string Session identifier
---@param state_id string State identifier
---@return boolean success Whether delete was successful
function retro_helpers.delete_save_state(session_id, state_id)
    local response = http.delete("/api/v1/retro/sessions/" .. session_id .. "/states/" .. state_id)
    return response.status == 200 or response.status == 204
end

-- Input handling

---Send button input
---@param session_id string Session identifier
---@param player number Player number (0-3)
---@param button string Button name (a, b, x, y, start, select, up, down, left, right, l, r)
---@param pressed boolean True for press, false for release
function retro_helpers.send_input(session_id, player, button, pressed)
    http.post("/api/v1/retro/sessions/" .. session_id .. "/input", {
        player = player,
        button = button,
        pressed = pressed
    })
end

---Send analog stick input
---@param session_id string Session identifier
---@param player number Player number (0-3)
---@param stick string "left" or "right"
---@param x number -1.0 to 1.0 horizontal axis
---@param y number -1.0 to 1.0 vertical axis
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
