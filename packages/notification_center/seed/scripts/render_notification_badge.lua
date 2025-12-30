--- Render a notification badge
---@param count number Unread notification count
---@return BadgeComponent|nil Badge component or nil if count is 0
local function render_notification_badge(count)
  if count > 0 then
    return {
      type = "badge",
      content = count > 99 and "99+" or tostring(count),
      variant = "error"
    }
  end
  return nil
end

return render_notification_badge
