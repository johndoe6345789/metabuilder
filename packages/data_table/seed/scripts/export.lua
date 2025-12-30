-- Export utilities for data tables
-- Provides CSV and JSON export functionality

---@class Export
local M = {}

---@class ExportOptions
---@field includeHeaders boolean Include column headers in export
---@field columns string[]|nil Specific columns to export (nil = all)
---@field delimiter string CSV delimiter (default: ",")
---@field lineEnding string Line ending (default: "\n")

---Escape a value for CSV
---@param value any Value to escape
---@return string Escaped CSV string
function M.escapeCsv(value)
  if value == nil then
    return ""
  end
  
  local str = tostring(value)
  
  -- Check if escaping is needed
  if string.find(str, '[,"\r\n]') then
    -- Escape double quotes by doubling them
    str = string.gsub(str, '"', '""')
    -- Wrap in double quotes
    str = '"' .. str .. '"'
  end
  
  return str
end

---Get column values from row data
---@param row table Row data object
---@param columns table[] Column definitions
---@param columnIds string[]|nil Specific column IDs (nil = all)
---@return string[] Array of values
function M.getRowValues(row, columns, columnIds)
  local values = {}
  
  if columnIds then
    -- Specific columns only
    for _, id in ipairs(columnIds) do
      table.insert(values, row[id])
    end
  else
    -- All columns
    for _, col in ipairs(columns) do
      if col.type ~= "actions" then
        table.insert(values, row[col.id])
      end
    end
  end
  
  return values
end

---Get column labels for headers
---@param columns table[] Column definitions
---@param columnIds string[]|nil Specific column IDs (nil = all)
---@return string[] Array of labels
function M.getColumnLabels(columns, columnIds)
  local labels = {}
  
  if columnIds then
    -- Specific columns only
    for _, id in ipairs(columnIds) do
      for _, col in ipairs(columns) do
        if col.id == id then
          table.insert(labels, col.label or col.id)
          break
        end
      end
    end
  else
    -- All columns (except actions)
    for _, col in ipairs(columns) do
      if col.type ~= "actions" then
        table.insert(labels, col.label or col.id)
      end
    end
  end
  
  return labels
end

---Export data to CSV format
---@param data table[] Array of row data objects
---@param columns table[] Column definitions
---@param options? ExportOptions Export options
---@return string CSV formatted string
function M.exportToCsv(data, columns, options)
  options = options or {}
  local includeHeaders = options.includeHeaders ~= false
  local columnIds = options.columns
  local delimiter = options.delimiter or ","
  local lineEnding = options.lineEnding or "\n"
  
  local lines = {}
  
  -- Add header row
  if includeHeaders then
    local headers = M.getColumnLabels(columns, columnIds)
    local escapedHeaders = {}
    for _, h in ipairs(headers) do
      table.insert(escapedHeaders, M.escapeCsv(h))
    end
    table.insert(lines, table.concat(escapedHeaders, delimiter))
  end
  
  -- Add data rows
  for _, row in ipairs(data) do
    local values = M.getRowValues(row, columns, columnIds)
    local escapedValues = {}
    for _, v in ipairs(values) do
      table.insert(escapedValues, M.escapeCsv(v))
    end
    table.insert(lines, table.concat(escapedValues, delimiter))
  end
  
  return table.concat(lines, lineEnding)
end

---Serialize a value to JSON
---@param value any Value to serialize
---@return string JSON string
function M.jsonEncode(value)
  local t = type(value)
  
  if value == nil then
    return "null"
  elseif t == "boolean" then
    return value and "true" or "false"
  elseif t == "number" then
    return tostring(value)
  elseif t == "string" then
    -- Escape special characters
    local escaped = value
    escaped = string.gsub(escaped, '\\', '\\\\')
    escaped = string.gsub(escaped, '"', '\\"')
    escaped = string.gsub(escaped, '\n', '\\n')
    escaped = string.gsub(escaped, '\r', '\\r')
    escaped = string.gsub(escaped, '\t', '\\t')
    return '"' .. escaped .. '"'
  elseif t == "table" then
    -- Check if array or object
    local isArray = true
    local maxIndex = 0
    for k, _ in pairs(value) do
      if type(k) ~= "number" or k < 1 or k ~= math.floor(k) then
        isArray = false
        break
      end
      if k > maxIndex then maxIndex = k end
    end
    isArray = isArray and maxIndex == #value
    
    if isArray then
      local items = {}
      for _, v in ipairs(value) do
        table.insert(items, M.jsonEncode(v))
      end
      return "[" .. table.concat(items, ",") .. "]"
    else
      local items = {}
      for k, v in pairs(value) do
        table.insert(items, M.jsonEncode(tostring(k)) .. ":" .. M.jsonEncode(v))
      end
      return "{" .. table.concat(items, ",") .. "}"
    end
  end
  
  return "null"
end

---Export data to JSON format
---@param data table[] Array of row data objects
---@param columns? table[] Column definitions (optional, for column filtering)
---@param columnIds? string[] Specific columns to export (nil = all)
---@return string JSON formatted string
function M.exportToJson(data, columns, columnIds)
  local result
  
  if columns and columnIds then
    -- Export only specified columns
    result = {}
    for _, row in ipairs(data) do
      local filtered = {}
      for _, id in ipairs(columnIds) do
        filtered[id] = row[id]
      end
      table.insert(result, filtered)
    end
  else
    result = data
  end
  
  return M.jsonEncode(result)
end

---Create a download-ready export object
---@param content string Export content
---@param filename string Suggested filename
---@param mimeType string MIME type
---@return table Export object with content, filename, mimeType
function M.createExport(content, filename, mimeType)
  return {
    content = content,
    filename = filename,
    mimeType = mimeType
  }
end

---Export to CSV with download metadata
---@param data table[] Array of row data objects
---@param columns table[] Column definitions
---@param filename? string Suggested filename (default: "export.csv")
---@param options? ExportOptions Export options
---@return table Export object
function M.downloadCsv(data, columns, filename, options)
  local csv = M.exportToCsv(data, columns, options)
  return M.createExport(csv, filename or "export.csv", "text/csv")
end

---Export to JSON with download metadata
---@param data table[] Array of row data objects
---@param filename? string Suggested filename (default: "export.json")
---@return table Export object
function M.downloadJson(data, filename)
  local json = M.exportToJson(data)
  return M.createExport(json, filename or "export.json", "application/json")
end

return M
