"""Workflow plugin: write blob to filesystem."""

from typing import Dict, Any
from pathlib import Path
import base64

from ...base import NodeExecutor


class BlobPut(NodeExecutor):
    """Write blob to filesystem."""

    node_type = "packagerepo.blob_put"
    category = "packagerepo"
    description = "Write blob to filesystem"

    def execute(self, inputs: Dict[str, Any], runtime: Any = None) -> Dict[str, Any]:
        """Write blob to filesystem."""
        key = inputs.get("key")
        data = inputs.get("data")
        encoding = inputs.get("encoding", "utf-8")  # utf-8, base64, or binary

        if not key:
            return {"error": "key is required"}

        if data is None:
            return {"error": "data is required"}

        if not runtime or not hasattr(runtime, "blob_dir"):
            return {"error": "blob_dir not available in runtime"}

        try:
            # Ensure blob directory exists
            blob_dir = Path(runtime.blob_dir)
            blob_dir.mkdir(parents=True, exist_ok=True)

            # Construct file path
            file_path = blob_dir / key

            # Ensure parent directory exists
            file_path.parent.mkdir(parents=True, exist_ok=True)

            # Convert data to bytes based on encoding
            if encoding == "base64":
                if isinstance(data, str):
                    data_bytes = base64.b64decode(data)
                else:
                    return {"error": "data must be a string for base64 encoding"}
            elif encoding == "binary":
                if isinstance(data, bytes):
                    data_bytes = data
                else:
                    return {"error": "data must be bytes for binary encoding"}
            else:  # utf-8 or other text encoding
                if isinstance(data, str):
                    data_bytes = data.encode(encoding)
                else:
                    return {"error": f"data must be a string for {encoding} encoding"}

            # Write to file
            file_path.write_bytes(data_bytes)

            return {"result": {"success": True, "key": key, "path": str(file_path), "size": len(data_bytes)}}

        except Exception as e:
            return {"error": f"failed to write blob: {str(e)}", "error_code": "BLOB_PUT_FAILED"}
