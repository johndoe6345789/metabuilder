-- JSON Script Runtime Executor
-- Executes script.json definitions at runtime without code generation

local M = {}

-- Reference resolver - resolves $ref:path.to.value
local function resolve_ref(ref, context)
  if type(ref) ~= "string" or not ref:match("^%$ref:") then
    return ref
  end

  local path = ref:sub(6) -- Remove "$ref:"
  local parts = {}
  for part in path:gmatch("[^.]+") do
    table.insert(parts, part)
  end

  local value = context
  for _, part in ipairs(parts) do
    if type(value) ~= "table" then
      return nil
    end
    value = value[part]
  end

  return value
end

-- Expression evaluator
local function eval_expression(expr, context)
  if type(expr) ~= "table" then
    return resolve_ref(expr, context)
  end

  local expr_type = expr.type

  -- Literal values
  if expr_type == "string_literal" then
    return expr.value
  elseif expr_type == "number_literal" then
    return expr.value
  elseif expr_type == "boolean_literal" then
    return expr.value
  elseif expr_type == "null_literal" then
    return nil
  end

  -- Template literals
  if expr_type == "template_literal" then
    local template = expr.template
    -- Simple interpolation ${variable}
    return template:gsub("%${([^}]+)}", function(varPath)
      local ref = "$ref:" .. varPath
      local value = resolve_ref(ref, context)
      return tostring(value or "")
    end)
  end

  -- Binary expressions
  if expr_type == "binary_expression" then
    local left = eval_expression(expr.left, context)
    local right = eval_expression(expr.right, context)
    local op = expr.operator

    if op == "+" then return left + right
    elseif op == "-" then return left - right
    elseif op == "*" then return left * right
    elseif op == "/" then return left / right
    elseif op == "%" then return left % right
    elseif op == "==" then return left == right
    elseif op == "!=" or op == "~=" then return left ~= right
    elseif op == "<" then return left < right
    elseif op == ">" then return left > right
    elseif op == "<=" then return left <= right
    elseif op == ">=" then return left >= right
    elseif op == "&&" or op == "and" then return left and right
    elseif op == "||" or op == "or" then return left or right
    end
  end

  -- Member access
  if expr_type == "member_access" then
    local obj = eval_expression(expr.object, context)
    if type(obj) == "table" then
      return obj[expr.property]
    end
    return nil
  end

  -- Call expression
  if expr_type == "call_expression" then
    local callee = resolve_ref(expr.callee, context)
    local args = {}
    if expr.args then
      for _, arg in ipairs(expr.args) do
        table.insert(args, eval_expression(arg, context))
      end
    end

    if type(callee) == "function" then
      return callee(table.unpack(args))
    end
  end

  -- Object literal
  if expr_type == "object_literal" then
    local obj = {}
    if expr.properties then
      for key, value in pairs(expr.properties) do
        obj[key] = eval_expression(value, context)
      end
    end
    return obj
  end

  -- Array literal
  if expr_type == "array_literal" then
    local arr = {}
    if expr.elements then
      for _, elem in ipairs(expr.elements) do
        table.insert(arr, eval_expression(elem, context))
      end
    end
    return arr
  end

  return nil
end

-- Statement executor
local function execute_statement(stmt, context)
  local stmt_type = stmt.type

  -- Variable declarations
  if stmt_type == "const_declaration" or stmt_type == "let_declaration" then
    local name = stmt.name
    local value = eval_expression(stmt.value, context)
    context.local_vars = context.local_vars or {}
    context.local_vars[name] = value
    return nil
  end

  -- Assignment
  if stmt_type == "assignment" then
    local target = stmt.target
    local value = eval_expression(stmt.value, context)
    -- Simple variable assignment
    if type(target) == "string" then
      context.local_vars = context.local_vars or {}
      context.local_vars[target] = value
    end
    return nil
  end

  -- If statement
  if stmt_type == "if_statement" then
    local condition = eval_expression(stmt.condition, context)
    if condition then
      if stmt.then then
        for _, s in ipairs(stmt.then) do
          local result = execute_statement(s, context)
          if result and result.type == "return" then
            return result
          end
        end
      end
    elseif stmt.else then
      for _, s in ipairs(stmt.else) do
        local result = execute_statement(s, context)
        if result and result.type == "return" then
          return result
        end
      end
    end
    return nil
  end

  -- Return statement
  if stmt_type == "return" then
    return {
      type = "return",
      value = eval_expression(stmt.value, context)
    }
  end

  -- Try-catch
  if stmt_type == "try_catch" then
    local success, err = pcall(function()
      if stmt.try then
        for _, s in ipairs(stmt.try) do
          local result = execute_statement(s, context)
          if result and result.type == "return" then
            return result
          end
        end
      end
    end)

    if not success and stmt.catch then
      context.catch = context.catch or {}
      context.catch.error = err
      for _, s in ipairs(stmt.catch.body) do
        local result = execute_statement(s, context)
        if result and result.type == "return" then
          return result
        end
      end
    end

    if stmt.finally then
      for _, s in ipairs(stmt.finally) do
        execute_statement(s, context)
      end
    end

    return nil
  end

  -- Call expression statement
  if stmt_type == "call_expression" then
    eval_expression(stmt, context)
    return nil
  end

  return nil
end

-- Execute function from script.json
function M.execute_function(script_json, function_name, args)
  -- Find function definition
  local func_def = nil
  for _, fn in ipairs(script_json.functions or {}) do
    if fn.name == function_name then
      func_def = fn
      break
    end
  end

  if not func_def then
    error("Function not found: " .. function_name)
  end

  -- Build context
  local context = {
    params = {},
    local_vars = {},
    constants = {},
    imports = {},
    functions = {}
  }

  -- Load constants
  for _, const in ipairs(script_json.constants or {}) do
    context.constants[const.name] = const.value
  end

  -- Set parameters
  args = args or {}
  for i, param in ipairs(func_def.params or {}) do
    local value = args[i]
    if value == nil and param.default then
      value = resolve_ref(param.default, context)
    end
    context.params[param.name] = value
  end

  -- Execute function body
  for _, stmt in ipairs(func_def.body or {}) do
    local result = execute_statement(stmt, context)
    if result and result.type == "return" then
      return result.value
    end
  end

  return nil
end

-- Load and execute script.json file
function M.load_and_execute(json_path, function_name, args)
  local file = io.open(json_path, "r")
  if not file then
    error("Cannot open file: " .. json_path)
  end

  local content = file:read("*all")
  file:close()

  -- Parse JSON (assuming json module available)
  local json = require("json")
  local script_json = json.decode(content)

  return M.execute_function(script_json, function_name, args)
end

return M
