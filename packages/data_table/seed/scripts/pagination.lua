-- Pagination utilities
local M = {}

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
