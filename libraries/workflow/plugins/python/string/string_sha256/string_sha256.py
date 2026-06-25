"""Workflow plugin: compute SHA256 hash of string/bytes."""

import hashlib
from ...base import NodeExecutor


class StringSha256(NodeExecutor):
    """Compute SHA256 hash of input string or bytes."""

    node_type = "string.sha256"
    category = "string"
    description = "Compute SHA256 hash of input string or bytes"

    def execute(self, inputs, runtime=None):
        """
        Compute SHA256 hash.

        Args:
            inputs: Dict with:
                - input: String or bytes to hash
                - prefix: Optional bool, whether to prepend "sha256:" (default: False)

        Returns:
            Dict with 'result' containing hex hash string
        """
        input_value = inputs.get("input", "")
        prefix = inputs.get("prefix", False)

        # Convert to bytes if string
        if isinstance(input_value, str):
            input_bytes = input_value.encode('utf-8')
        else:
            input_bytes = input_value

        # Compute hash
        hash_obj = hashlib.sha256(input_bytes)
        hex_hash = hash_obj.hexdigest()

        # Add prefix if requested
        if prefix:
            result = f"sha256:{hex_hash}"
        else:
            result = hex_hash

        return {"result": result}
