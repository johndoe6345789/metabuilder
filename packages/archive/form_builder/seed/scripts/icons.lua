-- Icon mappings for form builder components
-- This module provides icon names that work with fakemui icons

---@class FormBuilderIcons
local M = {}

---Common form icon names mapped to fakemui icons
M.icons = {
  -- Validation states
  CHECK_CIRCLE = "CheckCircle",
  CHECK_CIRCLE_OUTLINE = "CheckCircleOutline",
  ERROR = "CircleX",
  ERROR_OUTLINE = "ErrorOutline",
  WARNING = "Warning",
  WARNING_AMBER = "WarningAmber",
  INFO = "Info",
  INFO_OUTLINED = "InfoOutlined",

  -- Field types
  TEXT_FIELDS = "TextFields",
  EMAIL = "Email",
  LOCK = "Lock",
  CALENDAR = "Calendar",
  DATE_RANGE = "DateRange",
  ACCESS_TIME = "AccessTime",
  CHECKBOX = "Checkbox",
  RADIO = "Radio",
  TOGGLE_ON = "ToggleOn",

  -- Actions
  ADD = "Add",
  REMOVE = "Remove",
  EDIT = "Edit",
  DELETE = "Delete",
  SAVE = "Save",
  CLEAR = "Clear",
  CLOSE = "Close",

  -- Form controls
  VISIBILITY = "Visibility",
  VISIBILITY_OFF = "VisibilityOff",
  SEARCH = "Search",
  FILTER_LIST = "FilterList",

  -- File & media
  ATTACH_FILE = "AttachFile",
  INSERT_PHOTO = "InsertPhoto",
  UPLOAD = "Upload",
  FILE_UPLOAD = "UploadSimple",

  -- Rich text
  FORMAT_BOLD = "FormatBold",
  FORMAT_ITALIC = "FormatItalic",
  FORMAT_UNDERLINE = "FormatUnderline",
  FORMAT_LIST_BULLETED = "FormatListBulleted",
  FORMAT_LIST_NUMBERED = "FormatListNumbered",
  INSERT_LINK = "InsertLink",

  -- Form structure
  FORM = "Form",
  ARTICLE = "Article",
  DESCRIPTION = "Description",
  LABEL = "LocalOffer",
}

---Get icon name for a form element
---@param key string Icon key (e.g., "CHECK_CIRCLE")
---@return string icon_name The fakemui icon name
function M.get(key)
  return M.icons[key] or "Form"
end

return M
