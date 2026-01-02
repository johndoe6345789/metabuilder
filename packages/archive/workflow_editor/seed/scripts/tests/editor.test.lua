-- Workflow editor tests
-- Uses lua_test framework with parameterized test cases

describe("Workflow Editor", function()
  local cases = load_cases("editor.cases.json")
  local editor = require("editor")

  describe("render", function()
    it_each(cases.render, "$desc", function(tc)
      local result = editor.render(tc.input)
      expect(result.type).toBe("workflow_editor")
      expect(result.props.name).toBe(tc.expected_name)
      if tc.expected_id then
        expect(result.props.id).toBe(tc.expected_id)
      end
      if tc.expected_steps_count ~= nil then
        expect(#result.props.steps).toBe(tc.expected_steps_count)
      end
    end)
  end)

  describe("add_step", function()
    it_each(cases.add_step, "$desc", function(tc)
      local result = editor.add_step(tc.step_type, tc.config)
      expect(result.type).toBe("workflow_step")
      expect(result.step_type).toBe(tc.step_type)
      expect(result.position.x).toBe(0)
      expect(result.position.y).toBe(0)
      if tc.config then
        expect(result.config).toBeDefined()
      end
    end)
  end)

  describe("connect_steps", function()
    it_each(cases.connect_steps, "$desc", function(tc)
      local result = editor.connect_steps(tc.from, tc.to, tc.condition)
      expect(result.type).toBe("connection")
      expect(result.from).toBe(tc.from)
      expect(result.to).toBe(tc.to)
      if tc.condition then
        expect(result.condition).toBe(tc.condition)
      else
        expect(result.condition).toBeNil()
      end
    end)
  end)
end)
