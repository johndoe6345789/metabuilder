"""Workflow plugin: normalize entity fields."""

from typing import Dict, Any

from ...base import NodeExecutor


class NormalizeEntity(NodeExecutor):
    """Normalize entity fields (trim, lowercase, etc.)."""

    node_type = "packagerepo.normalize_entity"
    category = "packagerepo"
    description = "Normalize entity fields (trim, lowercase, etc.)"

    def execute(self, inputs: Dict[str, Any], runtime: Any = None) -> Dict[str, Any]:
        """Normalize entity fields."""
        entity = inputs.get("entity")
        rules = inputs.get("rules", {})

        if not entity:
            return {"error": "entity is required"}

        if not isinstance(entity, dict):
            return {"error": "entity must be a dictionary"}

        # Clone entity to avoid mutation
        normalized = entity.copy()

        # Apply normalization rules
        for field, operations in rules.items():
            if field not in normalized:
                continue

            value = normalized[field]

            # Handle string operations
            if isinstance(value, str):
                if "trim" in operations:
                    value = value.strip()
                if "lowercase" in operations:
                    value = value.lower()
                if "uppercase" in operations:
                    value = value.upper()
                if "title" in operations:
                    value = value.title()

                normalized[field] = value

            # Handle list operations
            elif isinstance(value, list):
                if "unique" in operations:
                    # Remove duplicates while preserving order
                    seen = set()
                    unique_list = []
                    for item in value:
                        if item not in seen:
                            seen.add(item)
                            unique_list.append(item)
                    value = unique_list

                if "sort" in operations:
                    value = sorted(value)

                normalized[field] = value

        return {"result": normalized}
