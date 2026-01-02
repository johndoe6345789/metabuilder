--[[
  Libretro save state management
  Creating, loading, and managing save states
]]

---@class RetroSaveStateModule
local M = {}

---Create a save state
---@param session_id string Session identifier
---@param slot? number Slot number (0-9), or -1 for auto
---@param description? string Optional description
---@return SaveState|nil state Save state info or nil if failed
function M.save_state(session_id, slot, description)
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
function M.load_state(session_id, slot)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/states/" .. slot .. "/load")
    return response.status == 200
end

---List save states for a session
---@param session_id string Session identifier
---@return SaveState[] states Array of save states
function M.list_save_states(session_id)
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
function M.delete_save_state(session_id, state_id)
    local response = http.delete("/api/v1/retro/sessions/" .. session_id .. "/states/" .. state_id)
    return response.status == 200 or response.status == 204
end

return M
