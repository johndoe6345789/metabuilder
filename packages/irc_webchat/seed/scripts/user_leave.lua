---@class LeaveMessage
---@field id string Message identifier
---@field channelId string Channel identifier
---@field username string Username (system)
---@field userId string User identifier (system)
---@field message string Leave notification message
---@field type string Message type (leave)
---@field timestamp number Timestamp in milliseconds

---@param channelId string Channel identifier
---@param username string Username of the user leaving
---@param userId string User identifier of the user leaving
---@return LeaveMessage Leave notification message object
function userLeave(channelId, username, userId)
  local leaveMsg = {
    id = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999),
    channelId = channelId,
    username = "System",
    userId = "system",
    message = username .. " has left the channel",
    type = "leave",
    timestamp = os.time() * 1000
  }

  log(username .. " left channel " .. channelId)
  return leaveMsg
end

return userLeave
