--- Validate styles.json structure and content
--- Supports both V1 (array) and V2 (object) schema formats
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

  -- Try to parse JSON
  local success, styles = pcall(function()
    return require("json").decode(content)
  end)

  if not success then
    result.success = false
    table.insert(result.messages, "styles.json is not valid JSON: " .. tostring(styles))
    return result
  end

  if type(styles) ~= "table" then
    result.success = false
    table.insert(result.messages, "styles.json must be either an array (V1) or object (V2)")
    return result
  end

  -- Detect schema version
  local schema_version = styles.schema_version or "1.0.0"

  -- Check if it's V2 (has schema_version or package field)
  if styles.schema_version or styles.package then
    return validate_styles_v2(styles, result)
  else
    -- V1: Array of style entries
    return validate_styles_v1(styles, result)
  end
end

--- Validate V1 schema (array format)
local function validate_styles_v1(styles, result)
  local seen_ids = {}

  for i, style in ipairs(styles) do
    local prefix = "Style entry #" .. i

    -- Check required fields
    if not style.id then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: id")
    else
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
      local valid_types = {
        global = true,
        component = true,
        utility = true,
        animation = true
      }
      if not valid_types[style.type] then
        result.success = false
        table.insert(result.messages, prefix .. " has invalid type: " .. style.type)
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

    if style.css and style.css:match("^%s*$") then
      table.insert(result.warnings, prefix .. " has empty CSS content")
    end
  end

  if #styles == 0 then
    table.insert(result.warnings, "styles.json contains no style entries")
  else
    table.insert(result.messages, "V1 schema: Found " .. #styles .. " style entries")
  end

  return result
end

--- Validate V2 schema (object format)
local function validate_styles_v2(styles, result)
  -- Validate schema_version
  if styles.schema_version then
    if type(styles.schema_version) ~= "string" then
      result.success = false
      table.insert(result.messages, "schema_version must be a string")
    elseif not styles.schema_version:match("^%d+%.%d+%.%d+$") then
      table.insert(result.warnings, "schema_version should follow semantic versioning (e.g., 2.0.0)")
    end
  end

  -- Validate package field
  if styles.package then
    if type(styles.package) ~= "string" then
      result.success = false
      table.insert(result.messages, "package must be a string")
    end
  end

  -- Validate tokens section
  if styles.tokens then
    if type(styles.tokens) ~= "table" then
      result.success = false
      table.insert(result.messages, "tokens must be an object")
    else
      validate_tokens(styles.tokens, result)
    end
  end

  -- Validate selectors section
  if styles.selectors then
    if type(styles.selectors) ~= "table" then
      result.success = false
      table.insert(result.messages, "selectors must be an array")
    else
      validate_selectors(styles.selectors, result)
    end
  end

  -- Validate effects section
  if styles.effects then
    if type(styles.effects) ~= "table" then
      result.success = false
      table.insert(result.messages, "effects must be an array")
    else
      validate_effects(styles.effects, result)
    end
  end

  -- Validate appearance section
  if styles.appearance then
    if type(styles.appearance) ~= "table" then
      result.success = false
      table.insert(result.messages, "appearance must be an array")
    else
      validate_appearance(styles.appearance, result)
    end
  end

  -- Validate layouts section
  if styles.layouts then
    if type(styles.layouts) ~= "table" then
      result.success = false
      table.insert(result.messages, "layouts must be an array")
    else
      validate_layouts(styles.layouts, result)
    end
  end

  -- Validate transitions section
  if styles.transitions then
    if type(styles.transitions) ~= "table" then
      result.success = false
      table.insert(result.messages, "transitions must be an array")
    else
      validate_transitions(styles.transitions, result)
    end
  end

  -- Validate rules section
  if styles.rules then
    if type(styles.rules) ~= "table" then
      result.success = false
      table.insert(result.messages, "rules must be an array")
    else
      validate_rules(styles.rules, result)
    end
  end

  -- Validate environments section
  if styles.environments then
    if type(styles.environments) ~= "table" then
      result.success = false
      table.insert(result.messages, "environments must be an array")
    else
      validate_environments(styles.environments, result)
    end
  end

  table.insert(result.messages, "V2 schema validated")

  return result
end

--- Validate tokens section
function validate_tokens(tokens, result)
  if tokens.colors and type(tokens.colors) ~= "table" then
    result.success = false
    table.insert(result.messages, "tokens.colors must be an object")
  end
  if tokens.spacing and type(tokens.spacing) ~= "table" then
    result.success = false
    table.insert(result.messages, "tokens.spacing must be an object")
  end
  if tokens.typography and type(tokens.typography) ~= "table" then
    result.success = false
    table.insert(result.messages, "tokens.typography must be an object")
  end
end

--- Validate selectors section
function validate_selectors(selectors, result)
  local seen_ids = {}

  for i, selector in ipairs(selectors) do
    local prefix = "Selector #" .. i

    if not selector.id then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: id")
    else
      if seen_ids[selector.id] then
        result.success = false
        table.insert(result.messages, prefix .. " has duplicate id: " .. selector.id)
      end
      seen_ids[selector.id] = true
    end

    if not selector.predicate then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: predicate")
    elseif type(selector.predicate) ~= "table" then
      result.success = false
      table.insert(result.messages, prefix .. " predicate must be an object")
    else
      -- Validate predicate structure
      if not selector.predicate.targetType then
        table.insert(result.warnings, prefix .. " predicate missing targetType")
      end
      if selector.predicate.classes and type(selector.predicate.classes) ~= "table" then
        result.success = false
        table.insert(result.messages, prefix .. " predicate.classes must be an array")
      end
      if selector.predicate.states and type(selector.predicate.states) ~= "table" then
        result.success = false
        table.insert(result.messages, prefix .. " predicate.states must be an array")
      end
    end
  end
end

--- Validate effects section
function validate_effects(effects, result)
  local seen_ids = {}

  for i, effect in ipairs(effects) do
    local prefix = "Effect #" .. i

    if not effect.id then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: id")
    else
      if seen_ids[effect.id] then
        result.success = false
        table.insert(result.messages, prefix .. " has duplicate id: " .. effect.id)
      end
      seen_ids[effect.id] = true
    end

    if not effect.properties then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: properties")
    elseif type(effect.properties) ~= "table" then
      result.success = false
      table.insert(result.messages, prefix .. " properties must be an object")
    end
  end
end

--- Validate appearance section
function validate_appearance(appearance, result)
  local seen_ids = {}

  for i, app in ipairs(appearance) do
    local prefix = "Appearance #" .. i

    if not app.id then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: id")
    else
      if seen_ids[app.id] then
        result.success = false
        table.insert(result.messages, prefix .. " has duplicate id: " .. app.id)
      end
      seen_ids[app.id] = true
    end

    if not app.layers then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: layers")
    elseif type(app.layers) ~= "table" then
      result.success = false
      table.insert(result.messages, prefix .. " layers must be an array")
    else
      for j, layer in ipairs(app.layers) do
        if not layer.type then
          result.success = false
          table.insert(result.messages, prefix .. " layer #" .. j .. " missing type")
        else
          local valid_layer_types = {
            background = true,
            foreground = true,
            border = true,
            shadow = true,
            filter = true
          }
          if not valid_layer_types[layer.type] then
            table.insert(result.warnings, prefix .. " layer #" .. j .. " has unknown type: " .. layer.type)
          end
        end
      end
    end
  end
end

--- Validate layouts section
function validate_layouts(layouts, result)
  local seen_ids = {}

  for i, layout in ipairs(layouts) do
    local prefix = "Layout #" .. i

    if not layout.id then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: id")
    else
      if seen_ids[layout.id] then
        result.success = false
        table.insert(result.messages, prefix .. " has duplicate id: " .. layout.id)
      end
      seen_ids[layout.id] = true
    end

    if not layout.type then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: type")
    else
      local valid_layout_types = {
        flow = true,
        flex = true,
        grid = true,
        absolute = true,
        sticky = true
      }
      if not valid_layout_types[layout.type] then
        result.success = false
        table.insert(result.messages, prefix .. " has invalid type: " .. layout.type)
      end
    end

    if not layout.constraints then
      table.insert(result.warnings, prefix .. " missing constraints")
    elseif type(layout.constraints) ~= "table" then
      result.success = false
      table.insert(result.messages, prefix .. " constraints must be an object")
    end
  end
end

--- Validate transitions section
function validate_transitions(transitions, result)
  local seen_ids = {}

  for i, transition in ipairs(transitions) do
    local prefix = "Transition #" .. i

    if not transition.id then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: id")
    else
      if seen_ids[transition.id] then
        result.success = false
        table.insert(result.messages, prefix .. " has duplicate id: " .. transition.id)
      end
      seen_ids[transition.id] = true
    end

    if not transition.trigger then
      table.insert(result.warnings, prefix .. " missing trigger")
    end

    if not transition.properties then
      table.insert(result.warnings, prefix .. " missing properties")
    elseif type(transition.properties) ~= "table" then
      result.success = false
      table.insert(result.messages, prefix .. " properties must be an array")
    end
  end
end

--- Validate rules section (the cascade layer)
function validate_rules(rules, result)
  local seen_ids = {}

  for i, rule in ipairs(rules) do
    local prefix = "Rule #" .. i

    if not rule.id then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: id")
    else
      if seen_ids[rule.id] then
        result.success = false
        table.insert(result.messages, prefix .. " has duplicate id: " .. rule.id)
      end
      seen_ids[rule.id] = true
    end

    if not rule.selector then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: selector")
    elseif type(rule.selector) ~= "string" then
      result.success = false
      table.insert(result.messages, prefix .. " selector must be a string reference")
    end

    if not rule.priority then
      table.insert(result.warnings, prefix .. " missing priority (cascade resolution)")
    elseif type(rule.priority) ~= "table" then
      result.success = false
      table.insert(result.messages, prefix .. " priority must be an object")
    else
      -- Validate priority structure
      if not rule.priority.importance then
        table.insert(result.warnings, prefix .. " priority missing importance")
      end
      if not rule.priority.specificity then
        table.insert(result.warnings, prefix .. " priority missing specificity")
      elseif type(rule.priority.specificity) ~= "table" then
        result.success = false
        table.insert(result.messages, prefix .. " priority.specificity must be an object")
      end
    end

    if rule.enabled ~= nil and type(rule.enabled) ~= "boolean" then
      result.success = false
      table.insert(result.messages, prefix .. " enabled must be a boolean")
    end
  end
end

--- Validate environments section
function validate_environments(environments, result)
  local seen_ids = {}

  for i, env in ipairs(environments) do
    local prefix = "Environment #" .. i

    if not env.id then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: id")
    else
      if seen_ids[env.id] then
        result.success = false
        table.insert(result.messages, prefix .. " has duplicate id: " .. env.id)
      end
      seen_ids[env.id] = true
    end

    if not env.conditions then
      result.success = false
      table.insert(result.messages, prefix .. " missing required field: conditions")
    elseif type(env.conditions) ~= "table" then
      result.success = false
      table.insert(result.messages, prefix .. " conditions must be an object")
    end
  end
end

return validate_styles
