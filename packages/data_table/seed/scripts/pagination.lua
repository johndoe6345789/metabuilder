-- Pagination utilities

---@class Pagination
local M = {}

---@class PaginationState
---@field total integer Total number of items
---@field page integer Current page number (1-indexed)
---@field per_page integer Items per page
---@field pages integer Total number of pages
---@field has_prev boolean Whether there is a previous page
---@field has_next boolean Whether there is a next page

---@class PaginationProps
---@field current integer Current page number
---@field total integer Total number of pages
---@field show_prev boolean Whether to show previous button
---@field show_next boolean Whether to show next button
---@field on_prev string Event handler name for previous button
---@field on_next string Event handler name for next button

---@class PaginationComponent
---@field type "pagination"
---@field props PaginationProps

---Calculate pagination state
---@param total integer Total number of items
---@param page integer Current page number (1-indexed)
---@param per_page integer Items per page
---@return PaginationState
function M.calculate(total, page, per_page)
  local pages = math.ceil(total / per_page)
  return {
    total = total,
    page = page,
    per_page = per_page,
    pages = pages,
    has_prev = page > 1,
    has_next = page < pages
  }
end

---Render pagination component
---@param pagination PaginationState
---@return PaginationComponent
function M.render(pagination)
  return {
    type = "pagination",
    props = {
      current = pagination.page,
      total = pagination.pages,
      show_prev = pagination.has_prev,
      show_next = pagination.has_next,
      on_prev = "prev_page",
      on_next = "next_page"
    }
  }
end

return M
