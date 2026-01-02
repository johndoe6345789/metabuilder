-- Workflow run card tests
-- Uses lua_test framework with parameterized test cases

describe("Workflow Run Cards", function()
  local cases = load_cases("run.cases.json")
  local run = require("run")

  describe("render", function()
    it_each(cases.render, "$desc", function(tc)
      local result = run.render(tc.input)
      expect(result.type).toBe("card")
      expect(result.props.title).toBe(tc.expected_title)
      expect(result.props.subtitle).toBe(tc.expected_subtitle)
      expect(#result.children).toBe(3)

      -- Check started timestamp
      expect(result.children[1].type).toBe("text")
      expect(result.children[1].content).toContain("Started:")

      -- Check duration
      expect(result.children[2].type).toBe("text")
      expect(result.children[2].content).toContain("Duration:")
      if tc.expected_duration then
        expect(result.children[2].content).toContain(tc.expected_duration)
      end

      -- Check status badge
      expect(result.children[3].type).toBe("status_badge")
      expect(result.children[3].status).toBe(tc.expected_status)
    end)
  end)

  describe("render_list", function()
    it_each(cases.render_list, "$desc", function(tc)
      local result = run.render_list(tc.input)
      expect(result.type).toBe("grid")
      expect(result.columns).toBe(2)
      expect(#result.children).toBe(tc.expected_count)

      -- Verify all children are cards
      for i, child in ipairs(result.children) do
        expect(child.type).toBe("card")
      end
    end)

    it("renders empty list", function()
      local result = run.render_list({})
      expect(result.type).toBe("grid")
      expect(result.columns).toBe(2)
      expect(#result.children).toBe(0)
    end)
  end)
end)
