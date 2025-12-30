---@param timestamp number Unix timestamp in milliseconds
---@return string Formatted time string in HH:MM AM/PM format
function formatTime(timestamp)
  local date = os.date("*t", timestamp / 1000)
  local hour = date.hour
  local ampm = "AM"

  if hour >= 12 then
    ampm = "PM"
    if hour > 12 then
      hour = hour - 12
    end
  end

  if hour == 0 then
    hour = 12
  end

  return string.format("%02d:%02d %s", hour, date.min, ampm)
end

return formatTime
