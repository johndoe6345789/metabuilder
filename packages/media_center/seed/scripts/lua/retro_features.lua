--[[
  Libretro advanced features
  Shaders, cheats, netplay, and RetroAchievements
]]

---@class RetroFeaturesModule
local M = {}

-- ============================================================================
-- Shaders
-- ============================================================================

---Set shader preset
---@param session_id string Session identifier
---@param preset string Shader preset name
function M.set_shader(session_id, preset)
    http.patch("/api/v1/retro/sessions/" .. session_id, {
        shader_preset = preset
    })
end

---Get available shader presets
---@return string[] presets Array of shader preset names
function M.get_shaders()
    local response = http.get("/api/v1/retro/shaders")
    if response.status == 200 then
        return response.json.presets
    end
    return {}
end

-- ============================================================================
-- Cheats
-- ============================================================================

---Load cheat codes
---@param session_id string Session identifier
---@param codes string[] Array of cheat codes (Game Genie, Action Replay, etc.)
function M.load_cheats(session_id, codes)
    http.post("/api/v1/retro/sessions/" .. session_id .. "/cheats", {
        codes = codes
    })
end

---Enable or disable a cheat
---@param session_id string Session identifier
---@param index number Cheat index
---@param enabled boolean True to enable, false to disable
function M.set_cheat_enabled(session_id, index, enabled)
    http.patch("/api/v1/retro/sessions/" .. session_id .. "/cheats/" .. index, {
        enabled = enabled
    })
end

-- ============================================================================
-- Netplay
-- ============================================================================

---Host a netplay session
---@param session_id string Session identifier
---@param port number Port to listen on
---@param password? string Optional password
---@return string|nil room_code Room code or nil if failed
function M.host_netplay(session_id, port, password)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/netplay/host", {
        port = port,
        password = password
    })
    if response.status == 200 then
        return response.json.room_code
    end
    return nil
end

---Join a netplay session
---@param session_id string Session identifier
---@param host string Host address
---@param port number Port number
---@param password? string Optional password
---@return boolean success Whether join was successful
function M.join_netplay(session_id, host, port, password)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/netplay/join", {
        host = host,
        port = port,
        password = password
    })
    return response.status == 200
end

---Disconnect from netplay
---@param session_id string Session identifier
function M.disconnect_netplay(session_id)
    http.post("/api/v1/retro/sessions/" .. session_id .. "/netplay/disconnect")
end

-- ============================================================================
-- RetroAchievements
-- ============================================================================

---Login to RetroAchievements
---@param username string RetroAchievements username
---@param password string RetroAchievements password
---@return string|nil token Authentication token or nil if failed
function M.ra_login(username, password)
    local response = http.post("/api/v1/retro/retroachievements/login", {
        username = username,
        password = password
    })
    if response.status == 200 then
        return response.json.token
    end
    return nil
end

---Get achievements for current game
---@param session_id string Session identifier
---@return Achievement[] achievements Array of achievements
function M.get_achievements(session_id)
    local response = http.get("/api/v1/retro/sessions/" .. session_id .. "/achievements")
    if response.status == 200 then
        return response.json.achievements
    end
    return {}
end

return M
