"""Workflow plugin: parse URL path with Express-style parameters."""

import re
from typing import Dict, Any

from ...base import NodeExecutor


class ParsePath(NodeExecutor):
    """Parse URL path with Express-style :param patterns."""

    node_type = "packagerepo.parse_path"
    category = "packagerepo"
    description = "Parse URL path with Express-style :param patterns"

    def execute(self, inputs: Dict[str, Any], runtime: Any = None) -> Dict[str, Any]:
        """Parse URL path against pattern."""
        path = inputs.get("path")
        pattern = inputs.get("pattern")

        if not path:
            return {"error": "path is required"}

        if not pattern:
            return {"error": "pattern is required"}

        # Convert Express-style pattern to regex
        # Example: /packages/:owner/:name -> /packages/(?P<owner>[^/]+)/(?P<name>[^/]+)
        regex_pattern = pattern

        # Replace :param with named regex groups
        regex_pattern = re.sub(r':([a-zA-Z_][a-zA-Z0-9_]*)', r'(?P<\1>[^/]+)', regex_pattern)

        # Escape forward slashes and add anchors
        regex_pattern = f'^{regex_pattern}$'

        try:
            match = re.match(regex_pattern, path)
            if match:
                params = match.groupdict()
                return {"result": {"params": params, "matched": True}}
            else:
                return {"result": {"params": {}, "matched": False}}
        except re.error as e:
            return {"error": f"invalid pattern: {str(e)}", "error_code": "INVALID_PATTERN"}
