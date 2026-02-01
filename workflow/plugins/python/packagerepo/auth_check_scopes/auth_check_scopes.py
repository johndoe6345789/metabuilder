"""Workflow plugin: check if principal has required scopes."""

from typing import Dict, Any, List

from ...base import NodeExecutor


class AuthCheckScopes(NodeExecutor):
    """Check if principal has required scopes."""

    node_type = "packagerepo.auth_check_scopes"
    category = "packagerepo"
    description = "Check if principal has required scopes"

    def execute(self, inputs: Dict[str, Any], runtime: Any = None) -> Dict[str, Any]:
        """Check if principal has required scopes."""
        principal = inputs.get("principal")
        required_scopes = inputs.get("required_scopes", [])

        if not principal:
            return {"error": "principal is required"}

        # Extract scopes from principal
        principal_scopes = principal.get("scopes", [])
        if isinstance(principal_scopes, str):
            principal_scopes = [principal_scopes]

        # Ensure required_scopes is a list
        if isinstance(required_scopes, str):
            required_scopes = [required_scopes]

        # Check if all required scopes are present
        has_all_scopes = all(scope in principal_scopes for scope in required_scopes)

        # Find missing scopes
        missing_scopes = [scope for scope in required_scopes if scope not in principal_scopes]

        result = {
            "authorized": has_all_scopes,
            "missing_scopes": missing_scopes,
        }

        return {"result": result}
