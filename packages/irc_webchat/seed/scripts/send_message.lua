-- Send IRC Message
-- Sends a message to the chat channel

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
