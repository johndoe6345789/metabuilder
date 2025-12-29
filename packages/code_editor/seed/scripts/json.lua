-- JSON Editor utilities
local M = {}

function M.render(value, options)
  return {
    type = "code_editor",
    props = {
      language = "json",
      value = value or "{}",
      read_only = options and options.read_only or false,
      line_numbers = true,
      auto_format = true
    }
  }
end

function M.validate(json_string)
  -- JSON validation placeholder
  return {
    valid = true,
    errors = {}
  }
end

function M.format(json_string)
  return {
    action = "format",
    language = "json"
  }
end

return M
