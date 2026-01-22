"""Workflow plugin: branch condition."""

import re

from ...base import NodeExecutor


class BranchCondition(NodeExecutor):
    """Evaluate a branch condition using various comparison modes."""

    node_type = "utils.branch_condition"
    category = "utils"
    description = "Evaluate a branch condition using various comparison modes"

    def execute(self, inputs, runtime=None):
        """Evaluate a branch condition."""
        value = inputs.get("value")
        mode = inputs.get("mode", "is_truthy")
        compare = inputs.get("compare", "")
        decision = False

        if mode == "is_empty":
            decision = not value if isinstance(value, (list, dict, str)) else not bool(value)
        elif mode == "is_truthy":
            decision = bool(value)
        elif mode == "equals":
            decision = str(value) == compare
        elif mode == "not_equals":
            decision = str(value) != compare
        elif mode == "contains":
            decision = compare in str(value)
        elif mode == "regex":
            decision = bool(re.search(compare, str(value)))

        return {"result": decision}
