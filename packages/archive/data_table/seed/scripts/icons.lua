-- Icon mappings for data table components
-- This module provides icon names that work with fakemui icons

---@class DataTableIcons
local M = {}

---Common data table icon names mapped to fakemui icons
M.icons = {
  -- Sorting
  SORT = "Sort",
  SORT_ASCENDING = "SortAscending",
  SORT_DESCENDING = "SortDescending",
  ARROW_UP_DOWN = "ArrowUpDown",

  -- Filtering
  FILTER = "Filter",
  FILTER_LIST = "FilterList",
  FILTER_OFF = "FilterOff",
  FILTER_CLEAR = "FilterClear",
  FUNNEL = "Funnel",

  -- Actions
  EDIT = "Edit",
  DELETE = "Delete",
  TRASH = "Trash",
  ADD = "Add",
  REMOVE = "Remove",
  COPY = "Copy",
  SAVE = "Save",

  -- Export
  DOWNLOAD = "Download",
  UPLOAD = "Upload",
  EXPORT = "Export",
  CSV = "Csv",
  JSON = "Json",

  -- Selection
  CHECKBOX = "Checkbox",
  CHECK_BOX = "CheckBox",
  CHECK_BOX_OUTLINE_BLANK = "CheckBoxOutlineBlank",
  INDETERMINATE_CHECK_BOX = "IndeterminateCheckBox",
  SELECT_ALL = "SelectAll",
  ROW_SELECT = "RowSelect",

  -- Pagination
  FIRST_PAGE = "FirstPage",
  LAST_PAGE = "LastPage",
  CHEVRON_LEFT = "ChevronLeft",
  CHEVRON_RIGHT = "ChevronRight",
  NAVIGATE_BEFORE = "NavigateBefore",
  NAVIGATE_NEXT = "NavigateNext",

  -- View options
  VIEW_LIST = "ViewList",
  VIEW_MODULE = "ViewModule",
  GRID_VIEW = "GridView",
  TABLE_CHART = "TableChart",
  COLUMNS = "Columns",
  ROWS = "Rows",

  -- More actions
  MORE_VERT = "MoreVert",
  MORE_HORIZ = "MoreHoriz",

  -- Status
  CHECK_CIRCLE = "CheckCircle",
  ERROR = "CircleX",
  WARNING = "Warning",
  INFO = "Info",

  -- Refresh
  REFRESH = "Refresh",
  AUTORENEW = "Autorenew",
}

---Get icon name for a data table element
---@param key string Icon key (e.g., "SORT_ASCENDING")
---@return string icon_name The fakemui icon name
function M.get(key)
  return M.icons[key] or "Info"
end

return M
