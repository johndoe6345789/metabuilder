"""Workflow plugin: validate entity against JSON schema."""

import jsonschema
from typing import Dict, Any

from ...base import NodeExecutor


class ValidateEntity(NodeExecutor):
    """Validate entity against JSON schema."""

    node_type = "packagerepo.validate_entity"
    category = "packagerepo"
    description = "Validate entity against JSON schema"

    def execute(self, inputs: Dict[str, Any], runtime: Any = None) -> Dict[str, Any]:
        """Validate entity against schema."""
        entity = inputs.get("entity")
        schema = inputs.get("schema")

        if not entity:
            return {"error": "entity is required"}

        if not schema:
            return {"error": "schema is required"}

        try:
            # Validate entity against schema
            jsonschema.validate(instance=entity, schema=schema)

            return {"result": {"valid": True, "errors": []}}

        except jsonschema.ValidationError as e:
            # Collect validation errors
            errors = []
            errors.append({
                "path": list(e.path),
                "message": e.message,
                "schema_path": list(e.schema_path),
            })

            return {"result": {"valid": False, "errors": errors}}

        except jsonschema.SchemaError as e:
            return {"error": f"invalid schema: {str(e)}", "error_code": "INVALID_SCHEMA"}

        except Exception as e:
            return {"error": f"validation failed: {str(e)}", "error_code": "VALIDATION_FAILED"}
