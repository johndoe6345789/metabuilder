-- Blob Storage Operations
local M = {}

-- Upload a file/blob
function M.upload(name, content, metadata)
  if not name or name == "" then
    return { success = false, error = "File name is required" }
  end
  
  content = content or ""
  metadata = metadata or {
    ["content-type"] = "text/plain",
    ["uploaded-at"] = os.date("%Y-%m-%dT%H:%M:%SZ")
  }
  
  blob_upload(name, content, metadata)
  
  return {
    success = true,
    message = "Uploaded: " .. name,
    size = #content,
    metadata = metadata
  }
end

-- Download a file/blob
function M.download(name)
  if not name or name == "" then
    return { success = false, error = "File name is required" }
  end
  
  local content = blob_download(name)
  if content and content ~= "" then
    return {
      success = true,
      content = content,
      size = #content,
      message = "Downloaded successfully"
    }
  else
    return {
      success = false,
      message = "File not found or empty"
    }
  end
end

-- Delete a file/blob
function M.delete(name)
  if not name or name == "" then
    return { success = false, error = "File name is required" }
  end
  
  blob_delete(name)
  
  return {
    success = true,
    message = "Deleted: " .. name
  }
end

-- List all files/blobs
function M.list()
  local files = blob_list()
  return {
    success = true,
    files = files,
    count = #files,
    message = "Found " .. #files .. " files"
  }
end

-- Get file info (without downloading content)
function M.info(name)
  if not name or name == "" then
    return { success = false, error = "File name is required" }
  end
  
  local files = blob_list()
  local found = false
  for _, file in ipairs(files) do
    if file == name then
      found = true
      break
    end
  end
  
  if found then
    return {
      success = true,
      name = name,
      exists = true
    }
  else
    return {
      success = false,
      name = name,
      exists = false,
      message = "File not found"
    }
  end
end

return M
