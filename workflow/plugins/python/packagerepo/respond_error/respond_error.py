"""Workflow plugin: format error response."""

from typing import Dict, Any
import json

from ...base import NodeExecutor


class RespondError(NodeExecutor):
    """Format error response."""

    node_type = "packagerepo.respond_error"
    category = "packagerepo"
    description = "Format error response"

    def execute(self, inputs: Dict[str, Any], runtime: Any = None) -> Dict[str, Any]:
        """Format error response."""
        message = inputs.get("message", "An error occurred")
        error_code = inputs.get("error_code")
        status = inputs.get("status", 500)
        details = inputs.get("details")

        # Build error object
        error_obj = {
            "error": {
                "message": message,
            }
        }

        if error_code:
            error_obj["error"]["code"] = error_code

        if details:
            error_obj["error"]["details"] = details

        # Format response
        response = {
            "status": status,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(error_obj, indent=2),
        }

        return {"result": response}
