-- Icon mappings for workflow editor components
-- This module provides icon names that work with fakemui icons

---@class WorkflowIcons
local M = {}

---Common workflow icon names mapped to fakemui icons
M.icons = {
  -- Workflow elements
  WORKFLOW = "Workflow",
  GIT_BRANCH = "GitBranch",
  CALL_SPLIT = "CallSplit",
  ACCOUNT_TREE = "AccountTree",

  -- Node types
  PLAY = "Play",
  PLAY_ARROW = "PlayArrow",
  STOP = "Stop",
  PAUSE = "Pause",
  CHECK_CIRCLE = "CheckCircle",
  CIRCLE_X = "CircleX",

  -- Actions
  ADD = "Add",
  ADD_CIRCLE = "AddCircle",
  REMOVE = "Remove",
  REMOVE_CIRCLE = "RemoveCircle",
  EDIT = "Edit",
  DELETE = "Delete",

  -- Flow control
  ARROW_RIGHT = "ArrowRight",
  ARROW_DOWN = "ArrowDown",
  CALL_SPLIT = "CallSplit",
  NAVIGATE_NEXT = "NavigateNext",

  -- Status
  CHECK = "Check",
  DONE = "Done",
  ERROR = "CircleX",
  WARNING = "Warning",
  INFO = "Info",
  PENDING = "Clock",

  -- Tools
  BUILD = "Build",
  CODE = "Code",
  TERMINAL = "Terminal",
  SETTINGS = "Settings",

  -- Save & Export
  SAVE = "Save",
  DOWNLOAD = "Download",
  UPLOAD = "Upload",
  EXPORT = "Export",

  -- View controls
  ZOOM_IN = "ZoomIn",
  ZOOM_OUT = "ZoomOut",
  FULLSCREEN = "Fullscreen",
  FULLSCREEN_EXIT = "FullscreenExit",
  CENTER_FOCUS = "CenterFocusStrong",
}

---Get icon name for a workflow element
---@param key string Icon key (e.g., "WORKFLOW")
---@return string icon_name The fakemui icon name
function M.get(key)
  return M.icons[key] or "Workflow"
end

return M
