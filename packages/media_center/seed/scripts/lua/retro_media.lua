--[[
  Libretro media capture
  Screenshots, recording, and streaming
]]

---@class RetroMediaModule
local M = {}

---Take a screenshot
---@param session_id string Session identifier
---@return string|nil path Path to screenshot or nil if failed
function M.take_screenshot(session_id)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/screenshot")
    if response.status == 201 then
        return response.json.path
    end
    return nil
end

---Start recording gameplay
---@param session_id string Session identifier
---@param output_path string Where to save the recording
---@return boolean success Whether recording started successfully
function M.start_recording(session_id, output_path)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/recording/start", {
        output_path = output_path
    })
    return response.status == 200
end

---Stop recording
---@param session_id string Session identifier
---@return string|nil path Path to recording or nil if failed
function M.stop_recording(session_id)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/recording/stop")
    if response.status == 200 then
        return response.json.path
    end
    return nil
end

---Start streaming to RTMP
---@param session_id string Session identifier
---@param rtmp_url string RTMP ingest URL
---@return boolean success Whether streaming started successfully
function M.start_streaming(session_id, rtmp_url)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/stream/start", {
        rtmp_url = rtmp_url
    })
    return response.status == 200
end

---Stop streaming
---@param session_id string Session identifier
---@return boolean success Whether streaming stopped successfully
function M.stop_streaming(session_id)
    local response = http.post("/api/v1/retro/sessions/" .. session_id .. "/stream/stop")
    return response.status == 200
end

return M
