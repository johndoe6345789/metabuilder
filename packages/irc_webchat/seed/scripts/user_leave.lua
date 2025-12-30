-- User Leave Channel
-- Handles user leaving a channel

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
