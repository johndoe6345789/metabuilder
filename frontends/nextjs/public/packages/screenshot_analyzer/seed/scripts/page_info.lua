-- Page Information Extraction

---@class TitleResult
---@field success boolean Whether operation succeeded
---@field title string Page title

---@class UrlResult
---@field success boolean Whether operation succeeded
---@field url string Page URL

---@class ViewportResult
---@field success boolean Whether operation succeeded
---@field viewport Viewport Viewport object
---@field width integer Viewport width
---@field height integer Viewport height

---@class UserAgentResult
---@field success boolean Whether operation succeeded
---@field user_agent string Full user agent string
---@field truncated string Truncated user agent

---@class PageInfo
---@field title string Page title
---@field url string Page URL
---@field viewport Viewport Viewport dimensions
---@field user_agent string User agent string

---@class AllInfoResult
---@field success boolean Whether operation succeeded
---@field info PageInfo All page information

---@class ElementQueryResult
---@field success boolean Whether element was found
---@field error? string Error message if failed
---@field element? table Element data if found

---@class ElementCountResult
---@field success boolean Whether operation succeeded
---@field error? string Error message if failed
---@field selector? string Selector used
---@field count? integer Number of matching elements

---@class TextContentResult
---@field success boolean Whether operation succeeded
---@field text string Text content
---@field length integer Content length
---@field truncated boolean Whether content was truncated

---@class HtmlSampleResult
---@field success boolean Whether operation succeeded
---@field html string HTML sample
---@field length integer Sample length
---@field truncated boolean Whether sample was truncated

---@class PageInfoModule
local M = {}

---Get page title
---@return TitleResult
function M.get_title()
  return {
    success = true,
    title = page_get_title()
  }
end

---Get page URL
---@return UrlResult
function M.get_url()
  return {
    success = true,
    url = page_get_url()
  }
end

---Get viewport dimensions
---@return ViewportResult
function M.get_viewport()
  local viewport = page_get_viewport()
  return {
    success = true,
    viewport = viewport,
    width = viewport.width,
    height = viewport.height
  }
end

---Get user agent
---@return UserAgentResult
function M.get_user_agent()
  local ua = page_get_user_agent()
  return {
    success = true,
    user_agent = ua,
    truncated = string.sub(ua, 1, 50) .. "..."
  }
end

---Get all page info
---@return AllInfoResult
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

---Query a specific element
---@param selector string CSS selector
---@return ElementQueryResult
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

---Count elements matching selector
---@param selector string CSS selector
---@return ElementCountResult
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

---Get text content
---@param max_length? integer Maximum content length (default: 5000)
---@return TextContentResult
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

---Get HTML sample
---@param max_length? integer Maximum sample length (default: 3000)
---@return HtmlSampleResult
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
