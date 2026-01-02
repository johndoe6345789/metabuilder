-- Business logic tests for social_hub package
-- Tests: validate_content, submit_post, render_post, render_stat

local cases = load_cases("social.cases.json")

describe("social_hub/validate_content", function()
  ---Validate content for posts
  ---@param content? string Post content to validate
  ---@return ValidationResult Validation result with valid flag and optional error
  local function validate_content(content)
    if not content or content == "" then
      return { valid = false, error = "Post cannot be empty" }
    end
    if #content > 500 then
      return { valid = false, error = "Post too long (max 500 chars)" }
    end
    return { valid = true }
  end

  describe("basic validation", function()
    it_each(cases.validate_content)("should handle $desc", function(tc)
      local result = validate_content(tc.input)
      expect(result.valid).toBe(tc.valid)
      if tc.error then
        expect(result.error).toBe(tc.error)
      end
    end)
  end)

  describe("length validation", function()
    it_each(cases.validate_content_length)("should handle $desc ($length chars)", function(tc)
      local content = string.rep("x", tc.length)
      local result = validate_content(content)
      expect(result.valid).toBe(tc.valid)
    end)
  end)
end)

describe("social_hub/submit_post", function()
  ---Create a submit post action
  ---@param content string Post content
  ---@param media? string[] Media URLs
  ---@return SubmitAction Submit action with action type and data
  local function submit_post(content, media)
    return {
      action = "create_post",
      data = {
        content = content,
        media = media or {}
      }
    }
  end

  it_each(cases.submit_post)("should create action for $desc", function(tc)
    local result = submit_post(tc.content, tc.media)
    expect(result.action).toBe("create_post")
    expect(result.data.content).toBe(tc.content)
    expect(#result.data.media).toBe(#tc.expected_media)
    for i, url in ipairs(tc.expected_media) do
      expect(result.data.media[i]).toBe(url)
    end
  end)
end)

describe("social_hub/render_post", function()
  ---Render a post component
  ---@param post Post Post data
  ---@return PostComponent Post component structure
  local function render_post(post)
    return {
      type = "post",
      props = {
        id = post.id,
        author = post.author,
        content = post.content,
        likes = post.likes or 0,
        comments = post.comments or 0
      }
    }
  end

  it_each(cases.render_post)("should render $desc", function(tc)
    local post = {
      id = tc.id,
      author = tc.author,
      content = tc.content,
      likes = tc.likes,
      comments = tc.comments
    }
    local result = render_post(post)
    expect(result.type).toBe("post")
    expect(result.props.id).toBe(tc.id)
    expect(result.props.author).toBe(tc.author)
    expect(result.props.content).toBe(tc.content)
    expect(result.props.likes).toBe(tc.likes)
    expect(result.props.comments).toBe(tc.comments)
  end)
end)

describe("social_hub/render_stat", function()
  ---Render a stat card component
  ---@param label string Stat label
  ---@param value number Stat value
  ---@param icon string Icon name
  ---@return StatCardComponent Stat card component
  local function render_stat(label, value, icon)
    return {
      type = "stat_card",
      props = {
        label = label,
        value = value,
        icon = icon
      }
    }
  end

  it_each(cases.render_stat)("should render $desc", function(tc)
    local result = render_stat(tc.label, tc.value, tc.icon)
    expect(result.type).toBe("stat_card")
    expect(result.props.label).toBe(tc.label)
    expect(result.props.value).toBe(tc.value)
    expect(result.props.icon).toBe(tc.icon)
  end)
end)
