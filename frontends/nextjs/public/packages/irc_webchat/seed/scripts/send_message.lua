---@class ChatMessage
---@field id string Message identifier
---@field channelId string Channel identifier
---@field username string Username of the sender
---@field userId string User identifier
---@field message string Message content
---@field type string Message type
---@field timestamp number Timestamp in milliseconds

---@param channelId string Channel identifier
---@param username string Username of the sender
---@param userId string User identifier
---@param message string Message content to send
---@return ChatMessage Chat message object
function sendMessage(channelId, username, userId, message)
  local msgId = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999)
  local msg = {
    id = msgId,
    channelId = channelId,
    username = username,
    userId = userId,
    message = message,
    type = "message",
    timestamp = os.time() * 1000
  }
  log("Sending message: " .. message)
  return msg
end

return sendMessage
