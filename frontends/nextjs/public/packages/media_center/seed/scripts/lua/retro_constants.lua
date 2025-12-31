--[[
  Libretro/RetroArch constants
  Button mappings, system definitions, and shader presets
]]

---@class RetroConstantsModule
local M = {}

-- ============================================================================
-- Button Constants (matches libretro RETRO_DEVICE_ID_JOYPAD_*)
-- ============================================================================

M.BUTTON = {
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
M.BUTTON.CROSS = M.BUTTON.B      -- PlayStation
M.BUTTON.CIRCLE = M.BUTTON.A    -- PlayStation
M.BUTTON.SQUARE = M.BUTTON.Y    -- PlayStation
M.BUTTON.TRIANGLE = M.BUTTON.X  -- PlayStation
M.BUTTON.RUN = M.BUTTON.START   -- PC Engine
M.BUTTON.OPTION = M.BUTTON.SELECT -- Atari

-- Analog stick axes
M.AXIS = {
    LEFT_X = "left_x",
    LEFT_Y = "left_y",
    RIGHT_X = "right_x",
    RIGHT_Y = "right_y",
}

-- ============================================================================
-- System Definitions
-- ============================================================================

M.SYSTEMS = {
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
M.SHADERS = {
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

return M
