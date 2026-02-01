"""Workflow plugin: put value in RocksDB key-value store."""

from typing import Dict, Any
import json

from ...base import NodeExecutor


class KvPut(NodeExecutor):
    """Put value in RocksDB key-value store."""

    node_type = "packagerepo.kv_put"
    category = "packagerepo"
    description = "Put value in RocksDB key-value store"

    def execute(self, inputs: Dict[str, Any], runtime: Any = None) -> Dict[str, Any]:
        """Put value in KV store."""
        key = inputs.get("key")
        value = inputs.get("value")

        if not key:
            return {"error": "key is required"}

        if value is None:
            return {"error": "value is required"}

        if not runtime or not hasattr(runtime, "kv_store"):
            return {"error": "kv_store not available in runtime"}

        try:
            # Convert value to bytes
            if isinstance(value, (dict, list)):
                # Serialize JSON objects
                value_bytes = json.dumps(value).encode("utf-8")
            elif isinstance(value, str):
                value_bytes = value.encode("utf-8")
            elif isinstance(value, bytes):
                value_bytes = value
            else:
                # Convert other types to string
                value_bytes = str(value).encode("utf-8")

            # Put value in KV store
            runtime.kv_store.put(key.encode("utf-8"), value_bytes)

            return {"result": {"success": True, "key": key}}

        except Exception as e:
            return {"error": f"failed to put value: {str(e)}", "error_code": "KV_PUT_FAILED"}
