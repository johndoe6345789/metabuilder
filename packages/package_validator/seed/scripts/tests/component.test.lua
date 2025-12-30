-- Component validation tests for schema_validator package
local component_schema = require("component_schema")

describe("Component Schema Validation", function()
  it("should validate a simple component", function()
    local valid_component = {
      id = "test_component",
      type = "TestComponent",
      name = "Test Component",
      description = "A test component"
    }

    local errors = component_schema.validate_component(valid_component)
    expect(#errors).toBe(0)
  end)

  it("should fail when component id is missing", function()
    local invalid_component = {
      type = "TestComponent",
      name = "Test Component"
    }

    local errors = component_schema.validate_component(invalid_component)
    expect(#errors).toBeGreaterThan(0)
  end)

  it("should fail when component type is missing", function()
    local invalid_component = {
      id = "test_component",
      name = "Test Component"
    }

    local errors = component_schema.validate_component(invalid_component)
    expect(#errors).toBeGreaterThan(0)
  end)

  it("should validate component with props", function()
    local valid_component = {
      id = "test_component",
      type = "TestComponent",
      props = {
        title = "Test",
        count = 5
      }
    }

    local errors = component_schema.validate_component(valid_component)
    expect(#errors).toBe(0)
  end)

  it("should validate component with layout", function()
    local valid_component = {
      id = "test_component",
      type = "TestComponent",
      layout = {
        type = "Box",
        props = { className = "test" },
        children = {}
      }
    }

    local errors = component_schema.validate_component(valid_component)
    expect(#errors).toBe(0)
  end)

  it("should validate nested layout structure", function()
    local valid_component = {
      id = "test_component",
      type = "TestComponent",
      layout = {
        type = "Box",
        children = {
          {
            type = "Card",
            children = {
              {
                type = "CardHeader",
                props = { text = "Title" }
              }
            }
          }
        }
      }
    }

    local errors = component_schema.validate_component(valid_component)
    expect(#errors).toBe(0)
  end)

  it("should fail when layout type is missing", function()
    local invalid_component = {
      id = "test_component",
      type = "TestComponent",
      layout = {
        props = { className = "test" }
      }
    }

    local errors = component_schema.validate_component(invalid_component)
    expect(#errors).toBeGreaterThan(0)
  end)

  it("should validate components array", function()
    local valid_components = {
      {
        id = "component_1",
        type = "Component1"
      },
      {
        id = "component_2",
        type = "Component2"
      }
    }

    local valid, errors = component_schema.validate_components(valid_components)
    expect(valid).toBe(true)
    expect(#errors).toBe(0)
  end)

  it("should validate empty components array", function()
    local valid_components = {}

    local valid, errors = component_schema.validate_components(valid_components)
    expect(valid).toBe(true)
    expect(#errors).toBe(0)
  end)

  it("should fail when components is not an array", function()
    local invalid_components = "not an array"

    local valid, errors = component_schema.validate_components(invalid_components)
    expect(valid).toBe(false)
    expect(#errors).toBeGreaterThan(0)
  end)

  it("should validate component with bindings", function()
    local valid_component = {
      id = "test_component",
      type = "TestComponent",
      bindings = {
        dbal = true,
        browser = false
      }
    }

    local errors = component_schema.validate_component(valid_component)
    expect(#errors).toBe(0)
  end)
end)
