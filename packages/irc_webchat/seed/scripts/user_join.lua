---@class JoinMessage
---@field id string Message identifier
---@field channelId string Channel identifier
---@field username string Username (system)
---@field userId string User identifier (system)
---@field message string Join notification message
---@field type string Message type (join)
---@field timestamp number Timestamp in milliseconds

---@param channelId string Channel identifier
---@param username string Username of the user joining
---@param userId string User identifier of the user joining
---@return JoinMessage Join notification message object
local function userJoin(channelId, username, userId)
  local joinMsg = {
    id = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999),
    channelId = channelId,
    username = "System",
    userId = "system",
    message = username .. " has joined the channel",
    type = "join",
    timestamp = os.time() * 1000
  }

  log(username .. " joined channel " .. channelId)
  return joinMsg
end

return userJoin
