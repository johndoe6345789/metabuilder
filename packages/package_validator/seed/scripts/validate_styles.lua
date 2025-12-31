--- Validate styles.json structure and content
---@param package_path string The path to the package
---@return table result Validation result with success and messages

local function validate_styles(package_path)
  local result = {
    success = true,
    messages = {},
    warnings = {}
  }

  local styles_path = package_path .. "/seed/styles.json"

  -- Check if styles.json exists (optional file)
  local file = io.open(styles_path, "r")
  if not file then
    table.insert(result.warnings, "No seed/styles.json file found (optional)")
    return result
  end

  -- Read and parse JSON
  local content = file:read("*all")
  file:close()

  if content == "" then
    result.success = false
    table.insert(result.messages, "styles.json is empty")
    return result
  end

  -- Try to parse JSON (basic validation)
  local success, styles = pcall(function()
    return require("json").decode(content)
  end)

  if not success then
    result.success = false
    table.insert(result.messages, "styles.json is not valid JSON: " .. tostring(styles))
    return result
  end

  -- Validate it's an array
  if type(styles) ~= "table" then
    result.success = false
    table.insert(result.messages, "styles.json must be an array of style objects")
    return result
  end

  -- Validate each style entry
  local seen_ids = {}
  for i, style in ipairs(styles) do
    local prefix = "Style entry #" .. i

    -- Check required fields
    if not style.id then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: id")
    else
      -- Check for duplicate IDs
      if seen_ids[style.id] then
        result.success = false
        table.insert(result.messages, prefix .. " has duplicate id: " .. style.id)
      end
      seen_ids[style.id] = true
    end

    if not style.type then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: type")
    else
      -- Validate type enum
      local valid_types = {
        global = true,
        component = true,
        utility = true,
        animation = true
      }
      if not valid_types[style.type] then
        result.success = false
        table.insert(result.messages, prefix .. " has invalid type: " .. style.type ..
          " (must be: global, component, utility, or animation)")
      end
    end

    if not style.css then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: css")
    elseif type(style.css) ~= "string" then
      result.success = false
      table.insert(result.messages, prefix .. " css field must be a string")
    end

    -- Validate optional fields
    if style.priority and type(style.priority) ~= "number" then
      table.insert(result.warnings, prefix .. " priority should be a number")
    end

    if style.className and type(style.className) ~= "string" then
      table.insert(result.warnings, prefix .. " className should be a string")
    end

    if style.description and type(style.description) ~= "string" then
      table.insert(result.warnings, prefix .. " description should be a string")
    end

    if style.category and type(style.category) ~= "string" then
      table.insert(result.warnings, prefix .. " category should be a string")
    end

    -- Validate CSS is not empty
    if style.css and style.css:match("^%s*$") then
      table.insert(result.warnings, prefix .. " has empty CSS content")
    end
  end

  -- Summary
  if #styles == 0 then
    table.insert(result.warnings, "styles.json contains no style entries")
  else
    table.insert(result.messages, "Found " .. #styles .. " style entries")
  end

  return result
end

return validate_styles
