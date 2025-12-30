-- User Join Channel
-- Handles user joining a channel

function userJoin(channelId, username, userId)
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
