"""Workflow plugin: filter list."""

import re

from ...base import NodeExecutor


class FilterList(NodeExecutor):
    """Filter items using a match mode."""

    node_type = "utils.filter_list"
    category = "utils"
    description = "Filter items using a match mode"

    def execute(self, inputs, runtime=None):
        """Filter items using a match mode."""
        items = inputs.get("items", [])
        if not isinstance(items, list):
            items = [items] if items else []

        mode = inputs.get("mode", "contains")
        pattern = inputs.get("pattern", "")
        filtered = []

        for item in items:
            candidate = str(item)
            matched = False
            if mode == "contains":
                matched = pattern in candidate
            elif mode == "regex":
                matched = bool(re.search(pattern, candidate))
            elif mode == "equals":
                matched = candidate == pattern
            elif mode == "not_equals":
                matched = candidate != pattern
            elif mode == "starts_with":
                matched = candidate.startswith(pattern)
            elif mode == "ends_with":
                matched = candidate.endswith(pattern)
            if matched:
                filtered.append(item)

        return {"items": filtered}
