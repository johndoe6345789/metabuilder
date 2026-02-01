"""Workflow plugin: format JSON response."""

from typing import Dict, Any
import json

from ...base import NodeExecutor


class RespondJson(NodeExecutor):
    """Format JSON response."""

    node_type = "packagerepo.respond_json"
    category = "packagerepo"
    description = "Format JSON response"

    def execute(self, inputs: Dict[str, Any], runtime: Any = None) -> Dict[str, Any]:
        """Format JSON response."""
        data = inputs.get("data")
        status = inputs.get("status", 200)
        headers = inputs.get("headers", {})

        # Ensure data is present
        if data is None:
            data = {}

        # Add default Content-Type header
        response_headers = {"Content-Type": "application/json"}
        response_headers.update(headers)

        # Format response
        response = {
            "status": status,
            "headers": response_headers,
            "body": json.dumps(data, indent=2),
        }

        return {"result": response}
