"""Workflow plugin: switch/case control flow."""

from ...base import NodeExecutor


class ControlSwitch(NodeExecutor):
    """Switch on value and return matching case."""

    node_type = "control.switch"
    category = "control"
    description = "Switch/case control flow"

    def execute(self, inputs, runtime=None):
        """Switch on value and return matching case.

        Args:
            inputs: Dictionary with keys:
                - value: The value to switch on
                - cases: dict - Map of case values to results
                - default: Default value if no case matches

        Returns:
            Dictionary with:
                - result: The matched case value or default
                - matched: bool - Whether a case was matched
        """
        value = inputs.get("value")
        cases = inputs.get("cases", {})
        default = inputs.get("default")

        result = cases.get(str(value), default)
        return {"result": result, "matched": str(value) in cases}
