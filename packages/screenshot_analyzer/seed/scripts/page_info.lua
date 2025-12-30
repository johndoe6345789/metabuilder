-- Page Information Extraction
local M = {}

-- Get page title
function M.get_title()
  return {
    success = true,
    title = page_get_title()
  }
end

-- Get page URL
function M.get_url()
  return {
    success = true,
    url = page_get_url()
  }
end

-- Get viewport dimensions
function M.get_viewport()
  local viewport = page_get_viewport()
  return {
    success = true,
    viewport = viewport,
    width = viewport.width,
    height = viewport.height
  }
end

-- Get user agent
function M.get_user_agent()
  local ua = page_get_user_agent()
  return {
    success = true,
    user_agent = ua,
    truncated = string.sub(ua, 1, 50) .. "..."
  }
end

-- Get all page info
function M.get_all()
  return {
    success = true,
    info = {
      title = page_get_title(),
      url = page_get_url(),
      viewport = page_get_viewport(),
      user_agent = page_get_user_agent()
    }
  }
end

-- Query a specific element
function M.query_element(selector)
  if not selector or selector == "" then
    return { success = false, error = "Selector is required" }
  end
  
  local result = dom_query_selector(selector)
  return {
    success = result.exists,
    element = result
  }
end

-- Count elements matching selector
function M.count_elements(selector)
  if not selector or selector == "" then
    return { success = false, error = "Selector is required" }
  end
  
  local count = dom_get_element_count(selector)
  return {
    success = true,
    selector = selector,
    count = count
  }
end

-- Get text content
function M.get_text_content(max_length)
  max_length = max_length or 5000
  local text = page_get_text_content(max_length)
  return {
    success = true,
    text = text,
    length = #text,
    truncated = #text >= max_length
  }
end

-- Get HTML sample
function M.get_html_sample(max_length)
  max_length = max_length or 3000
  local html = page_get_html_sample(max_length)
  return {
    success = true,
    html = html,
    length = #html,
    truncated = #html >= max_length
  }
end

return M
