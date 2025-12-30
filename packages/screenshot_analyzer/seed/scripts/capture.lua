-- Screenshot Capture Operations

---@class Viewport
---@field width integer Viewport width in pixels
---@field height integer Viewport height in pixels

---@class CaptureContext
---@field title string Page title
---@field url string Page URL
---@field viewport Viewport Viewport dimensions
---@field timestamp string ISO timestamp

---@class CaptureResult
---@field success boolean Whether capture preparation succeeded
---@field context CaptureContext Capture context data

---@class ValidationResult
---@field valid boolean Whether screenshot data is valid
---@field error? string Error message if invalid
---@field type? string Data type ("data_url" or "unknown")
---@field size? integer Data size in bytes

---@class CaptureStatus
---@field status "capturing" | "captured" | "idle" Current status
---@field message string Status message

---@class CaptureModule
local M = {}

---Prepare capture context (page info for capture)
---@return CaptureResult
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

---Generate filename for screenshot
---@param prefix? string Filename prefix (default: "screenshot")
---@return string Formatted filename with timestamp
function M.generate_filename(prefix)
  prefix = prefix or "screenshot"
  local timestamp = os.date("%Y%m%d_%H%M%S")
  return prefix .. "-" .. timestamp .. ".png"
end

---Validate screenshot data
---@param data? string Screenshot data (base64 or data URL)
---@return ValidationResult
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

---Get capture status
---@param is_capturing boolean Whether capture is in progress
---@param has_screenshot boolean Whether screenshot exists
---@return CaptureStatus
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
