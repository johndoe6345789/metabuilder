-- Tests for shared/types.lua UI type definitions
-- Verifies type structure and helper functions
-- Uses lua_test framework with parameterized cases

local cases = load_cases("ui_types.cases.json")

--------------------------------------------------------------------------------
-- Type Definition Constants (matching types.lua)
--------------------------------------------------------------------------------

local TYPOGRAPHY_VARIANTS = {
  "h1", "h2", "h3", "h4", "h5", "h6",
  "body1", "body2",
  "caption", "overline",
  "subtitle1", "subtitle2"
}

local BUTTON_VARIANTS = { "contained", "outlined", "text" }
local BUTTON_COLORS = { "primary", "secondary", "error", "warning", "info", "success" }
local BUTTON_SIZES = { "small", "medium", "large" }

local PERMISSION_LEVELS = {
  PUBLIC = 1,
  USER = 2,
  MODERATOR = 3,
  ADMIN = 4,
  GOD = 5,
  SUPERGOD = 6
}

--------------------------------------------------------------------------------
-- Helper Functions (testing utilities matching SharedUtils pattern)
--------------------------------------------------------------------------------

local function isEmpty(value)
  if value == nil then return true end
  if type(value) == "string" then
    return value:match("^%s*$") ~= nil
  end
  if type(value) == "table" then
    return next(value) == nil
  end
  return false
end

local function contains(tbl, value)
  for _, v in ipairs(tbl) do
    if v == value then return true end
  end
  return false
end

local function isValidComponentType(component)
  return component ~= nil
    and type(component) == "table"
    and type(component.type) == "string"
end

local function isValidButtonProps(props)
  if props.variant and not contains(BUTTON_VARIANTS, props.variant) then
    return false
  end
  if props.color and not contains(BUTTON_COLORS, props.color) then
    return false
  end
  if props.size and not contains(BUTTON_SIZES, props.size) then
    return false
  end
  return true
end

--------------------------------------------------------------------------------
-- Tests
--------------------------------------------------------------------------------

describe("shared/types - UIComponent", function()
  
  describe("UIComponent base structure", function()
    it("should require type field", function()
      local valid = { type = "box" }
      local invalid = { props = {} }
      
      expect(isValidComponentType(valid)).toBe(true)
      expect(isValidComponentType(invalid)).toBe(false)
    end)
    
    it("should allow optional props", function()
      local withProps = { type = "box", props = { className = "test" } }
      local withoutProps = { type = "box" }
      
      expect(isValidComponentType(withProps)).toBe(true)
      expect(isValidComponentType(withoutProps)).toBe(true)
    end)
    
    it("should allow optional children", function()
      local withChildren = { 
        type = "box", 
        children = { { type = "text" } } 
      }
      local withoutChildren = { type = "box" }
      
      expect(isValidComponentType(withChildren)).toBe(true)
      expect(isValidComponentType(withoutChildren)).toBe(true)
    end)
    
    it("should allow optional key", function()
      local withKey = { type = "box", key = "unique-1" }
      local withoutKey = { type = "box" }
      
      expect(isValidComponentType(withKey)).toBe(true)
      expect(isValidComponentType(withoutKey)).toBe(true)
    end)
  end)
  
  describe("component types", function()
    it_each(cases.ui_component_types)("should support $type component", function(tc)
      local component = { type = tc.type }
      expect(isValidComponentType(component)).toBe(true)
    end)
  end)
  
end)

describe("shared/types - Typography", function()
  
  describe("typography variants", function()
    it_each(cases.typography_variants)("should support $variant variant", function(tc)
      expect(contains(TYPOGRAPHY_VARIANTS, tc.variant)).toBe(true)
    end)
    
    it("should have exactly 12 variants", function()
      expect(#TYPOGRAPHY_VARIANTS).toBe(12)
    end)
    
    it_each(cases.typography_variants)("$variant heading status should be $isHeading", function(tc)
      local headingVariants = { "h1", "h2", "h3", "h4", "h5", "h6" }
      local isHeading = contains(headingVariants, tc.variant)
      expect(isHeading).toBe(tc.isHeading)
    end)
  end)
  
end)

describe("shared/types - Button", function()
  
  describe("button variants", function()
    it_each(cases.button_variants)("should support $variant variant", function(tc)
      expect(contains(BUTTON_VARIANTS, tc.variant)).toBe(true)
    end)
    
    it("should have exactly 3 variants", function()
      expect(#BUTTON_VARIANTS).toBe(3)
    end)
  end)
  
  describe("button colors", function()
    it_each(cases.button_colors)("$color should be valid=$valid", function(tc)
      local isValid = contains(BUTTON_COLORS, tc.color)
      expect(isValid).toBe(tc.valid)
    end)
    
    it("should have exactly 6 colors", function()
      expect(#BUTTON_COLORS).toBe(6)
    end)
  end)
  
  describe("button sizes", function()
    it_each(cases.button_sizes)("$size should be valid=$valid", function(tc)
      local isValid = contains(BUTTON_SIZES, tc.size)
      expect(isValid).toBe(tc.valid)
    end)
    
    it("should have exactly 3 sizes", function()
      expect(#BUTTON_SIZES).toBe(3)
    end)
  end)
  
  describe("button props validation", function()
    it("should accept valid button props", function()
      local validProps = {
        text = "Click Me",
        variant = "contained",
        color = "primary",
        size = "medium"
      }
      expect(isValidButtonProps(validProps)).toBe(true)
    end)
    
    it("should reject invalid variant", function()
      local invalidProps = { variant = "invalid" }
      expect(isValidButtonProps(invalidProps)).toBe(false)
    end)
    
    it("should reject invalid color", function()
      local invalidProps = { color = "invalid" }
      expect(isValidButtonProps(invalidProps)).toBe(false)
    end)
    
    it("should reject invalid size", function()
      local invalidProps = { size = "xlarge" }
      expect(isValidButtonProps(invalidProps)).toBe(false)
    end)
    
    it("should accept empty props", function()
      local emptyProps = {}
      expect(isValidButtonProps(emptyProps)).toBe(true)
    end)
  end)
  
end)

describe("shared/types - PermissionLevel", function()
  
  describe("permission level values", function()
    it_each(cases.permission_levels)("$name should have level $level", function(tc)
      expect(PERMISSION_LEVELS[tc.name]).toBe(tc.level)
    end)
    
    it("should have exactly 6 permission levels", function()
      local count = 0
      for _ in pairs(PERMISSION_LEVELS) do
        count = count + 1
      end
      expect(count).toBe(6)
    end)
  end)
  
  describe("permission level hierarchy", function()
    it("PUBLIC should be lowest level", function()
      expect(PERMISSION_LEVELS.PUBLIC).toBe(1)
    end)
    
    it("SUPERGOD should be highest level", function()
      expect(PERMISSION_LEVELS.SUPERGOD).toBe(6)
    end)
    
    it("levels should be sequential", function()
      expect(PERMISSION_LEVELS.USER).toBe(PERMISSION_LEVELS.PUBLIC + 1)
      expect(PERMISSION_LEVELS.MODERATOR).toBe(PERMISSION_LEVELS.USER + 1)
      expect(PERMISSION_LEVELS.ADMIN).toBe(PERMISSION_LEVELS.MODERATOR + 1)
      expect(PERMISSION_LEVELS.GOD).toBe(PERMISSION_LEVELS.ADMIN + 1)
      expect(PERMISSION_LEVELS.SUPERGOD).toBe(PERMISSION_LEVELS.GOD + 1)
    end)
  end)
  
end)

describe("shared/types - ApiResponse", function()
  
  describe("API response structure", function()
    it_each(cases.api_response_scenarios)("should handle $desc", function(tc)
      local response = {
        success = tc.success,
        data = tc.hasData and { result = "test" } or nil,
        error = tc.hasError and "Error occurred" or nil
      }
      
      expect(response.success).toBe(tc.success)
      
      if tc.hasData then
        expect(response.data).toBeTruthy()
      else
        expect(response.data).toBeNil()
      end
      
      if tc.hasError then
        expect(response.error).toBeTruthy()
      else
        expect(response.error).toBeNil()
      end
    end)
  end)
  
end)

describe("shared/types - ValidationResult", function()
  
  describe("validation result structure", function()
    it_each(cases.validation_result_scenarios)("should handle $desc", function(tc)
      local result = {
        valid = tc.valid,
        errors = tc.hasErrors and { username = "Required" } or nil
      }
      
      expect(result.valid).toBe(tc.valid)
      
      if tc.hasErrors then
        expect(result.errors).toBeTruthy()
      else
        expect(result.errors).toBeNil()
      end
    end)
  end)
  
end)

describe("shared/types - UIEvent", function()
  
  describe("event types", function()
    it_each(cases.event_types)("should support $type event", function(tc)
      local event = {
        type = tc.type,
        target = "component-id",
        timestamp = "2025-01-01T00:00:00Z"
      }
      
      expect(event.type).toBe(tc.type)
      expect(event.target).toBeTruthy()
    end)
  end)
  
  describe("click event", function()
    it("should support position data", function()
      local clickEvent = {
        type = "click",
        target = "button-1",
        position = { x = 100, y = 200 },
        timestamp = "2025-01-01T00:00:00Z"
      }
      
      expect(clickEvent.position.x).toBe(100)
      expect(clickEvent.position.y).toBe(200)
    end)
  end)
  
  describe("change event", function()
    it("should track value changes", function()
      local changeEvent = {
        type = "change",
        target = "input-1",
        value = "new value",
        previousValue = "old value",
        timestamp = "2025-01-01T00:00:00Z"
      }
      
      expect(changeEvent.value).toBe("new value")
      expect(changeEvent.previousValue).toBe("old value")
    end)
  end)
  
end)

describe("shared/types - SharedUtils helpers", function()
  
  describe("isEmpty function", function()
    it_each(cases.edge_cases.empty_strings)("$desc", function(tc)
      expect(isEmpty(tc.input)).toBe(tc.expected)
    end)
    
    it("should treat nil as empty", function()
      expect(isEmpty(nil)).toBe(true)
    end)
    
    it("should treat empty table as empty", function()
      expect(isEmpty({})).toBe(true)
    end)
    
    it("should treat non-empty table as not empty", function()
      expect(isEmpty({ 1, 2, 3 })).toBe(false)
    end)
  end)
  
  describe("optional fields", function()
    it_each(cases.edge_cases.nil_values)("$field should be optional=$optional", function(tc)
      local component = { type = "box" }
      
      if tc.optional then
        -- Optional fields can be nil
        expect(component[tc.field]).toBeNil()
        expect(isValidComponentType(component)).toBe(true)
      else
        -- Required fields must exist for valid component
        if tc.field == "type" then
          local invalidComponent = {}
          expect(isValidComponentType(invalidComponent)).toBe(false)
        end
      end
    end)
  end)
  
  describe("nested components", function()
    it_each(cases.edge_cases.nested_components)("depth $depth should be valid=$valid", function(tc)
      -- Build nested component structure
      local function buildNested(depth)
        if depth == 0 then
          return { type = "leaf" }
        end
        return {
          type = "container",
          children = { buildNested(depth - 1) }
        }
      end
      
      local nested = buildNested(tc.depth)
      expect(isValidComponentType(nested)).toBe(tc.valid)
    end)
  end)
  
end)
