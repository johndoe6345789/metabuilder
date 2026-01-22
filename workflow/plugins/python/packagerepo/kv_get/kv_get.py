"""Workflow plugin: get value from RocksDB key-value store."""

from typing import Dict, Any
import json

from ...base import NodeExecutor


class KvGet(NodeExecutor):
    """Get value from RocksDB key-value store."""

    node_type = "packagerepo.kv_get"
    category = "packagerepo"
    description = "Get value from RocksDB key-value store"

    def execute(self, inputs: Dict[str, Any], runtime: Any = None) -> Dict[str, Any]:
        """Get value from KV store."""
        key = inputs.get("key")

        if not key:
            return {"error": "key is required"}

        if not runtime or not hasattr(runtime, "kv_store"):
            return {"error": "kv_store not available in runtime"}

        try:
            # Get value from KV store
            value_bytes = runtime.kv_store.get(key.encode("utf-8"))

            if value_bytes is None:
                return {"result": {"found": False, "value": None}}

            # Try to decode as JSON
            try:
                value = json.loads(value_bytes.decode("utf-8"))
            except (json.JSONDecodeError, UnicodeDecodeError):
                # Return raw bytes as string if not JSON
                value = value_bytes.decode("utf-8", errors="replace")

            return {"result": {"found": True, "value": value}}

        except Exception as e:
            return {"error": f"failed to get value: {str(e)}", "error_code": "KV_GET_FAILED"}
