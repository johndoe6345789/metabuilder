"""Workflow plugin: verify JWT token and extract principal."""

import jwt
from typing import Dict, Any

from ...base import NodeExecutor


class AuthVerifyJwt(NodeExecutor):
    """Verify JWT token and extract principal information."""

    node_type = "packagerepo.auth_verify_jwt"
    category = "packagerepo"
    description = "Verify JWT token and extract principal"

    def execute(self, inputs: Dict[str, Any], runtime: Any = None) -> Dict[str, Any]:
        """Verify JWT token and extract principal."""
        token = inputs.get("token")
        secret = inputs.get("secret")

        if not token:
            return {"error": "token is required"}

        if not secret:
            return {"error": "secret is required"}

        try:
            # Decode JWT without verification if no secret provided
            # or with verification if secret is provided
            if secret == "none":
                # For development/testing - decode without verification
                payload = jwt.decode(token, options={"verify_signature": False})
            else:
                # Production - verify signature
                payload = jwt.decode(token, secret, algorithms=["HS256"])

            # Extract principal information
            principal = {
                "sub": payload.get("sub"),
                "scopes": payload.get("scopes", []),
                "exp": payload.get("exp"),
                "iat": payload.get("iat"),
                "tenant_id": payload.get("tenant_id"),
            }

            return {"result": principal}

        except jwt.ExpiredSignatureError:
            return {"error": "token has expired", "error_code": "TOKEN_EXPIRED"}
        except jwt.InvalidTokenError as e:
            return {"error": f"invalid token: {str(e)}", "error_code": "INVALID_TOKEN"}
        except Exception as e:
            return {"error": f"failed to verify token: {str(e)}", "error_code": "VERIFY_FAILED"}
