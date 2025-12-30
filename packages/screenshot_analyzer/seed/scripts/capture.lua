-- Screenshot Capture Operations
local M = {}

-- Prepare capture context (page info for capture)
function M.prepare_capture()
  local title = page_get_title()
  local url = page_get_url()
  local viewport = page_get_viewport()
  
  return {
    success = true,
    context = {
      title = title,
      url = url,
      viewport = viewport,
      timestamp = os.date("%Y-%m-%dT%H:%M:%SZ")
    }
  }
end

-- Generate filename for screenshot
function M.generate_filename(prefix)
  prefix = prefix or "screenshot"
  local timestamp = os.date("%Y%m%d_%H%M%S")
  return prefix .. "-" .. timestamp .. ".png"
end

-- Validate screenshot data
function M.validate_screenshot(data)
  if not data or data == "" then
    return {
      valid = false,
      error = "No screenshot data provided"
    }
  end
  
  -- Check if it looks like a data URL
  if string.sub(data, 1, 5) == "data:" then
    return {
      valid = true,
      type = "data_url",
      size = #data
    }
  end
  
  return {
    valid = true,
    type = "unknown",
    size = #data
  }
end

-- Get capture status
function M.get_status(is_capturing, has_screenshot)
  if is_capturing then
    return {
      status = "capturing",
      message = "Capturing screenshot..."
    }
  elseif has_screenshot then
    return {
      status = "captured",
      message = "Screenshot ready"
    }
  else
    return {
      status = "idle",
      message = "Ready to capture"
    }
  end
end

return M
