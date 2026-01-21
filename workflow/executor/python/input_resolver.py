"""Resolve workflow bindings and coercions."""
from .value_helpers import ValueHelpers


class InputResolver:
    """Resolve bindings in workflow inputs."""
    def __init__(self, store: dict):
        self.store = store

    def resolve_inputs(self, inputs: dict) -> dict:
        """Resolve bindings for every input."""
        return {key: self.resolve_binding(value) for key, value in (inputs or {}).items()}

    def resolve_binding(self, value):
        """Resolve a single binding value."""
        if isinstance(value, str) and value.startswith("$"):
            return self.store.get(value[1:])
        return value

    def coerce_bool(self, value) -> bool:
        """Coerce values into booleans."""
        return ValueHelpers.coerce_bool(value)
