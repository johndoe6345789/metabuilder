"""Workflow plugin: upsert entry in index store."""

from typing import Dict, Any

from ...base import NodeExecutor


class IndexUpsert(NodeExecutor):
    """Upsert entry in index store."""

    node_type = "packagerepo.index_upsert"
    category = "packagerepo"
    description = "Upsert entry in index store"

    def execute(self, inputs: Dict[str, Any], runtime: Any = None) -> Dict[str, Any]:
        """Upsert entry in index store."""
        index_name = inputs.get("index_name")
        key = inputs.get("key")
        document = inputs.get("document")

        if not index_name:
            return {"error": "index_name is required"}

        if not key:
            return {"error": "key is required"}

        if not document:
            return {"error": "document is required"}

        if not isinstance(document, dict):
            return {"error": "document must be a dictionary"}

        if not runtime or not hasattr(runtime, "index_store"):
            return {"error": "index_store not available in runtime"}

        try:
            # Upsert entry in index store
            # The index_store should have an upsert method that takes:
            # - index_name: name of the index
            # - key: unique identifier for the document
            # - document: dictionary of fields to index
            runtime.index_store.upsert(index_name, key, document)

            return {"result": {"success": True, "index": index_name, "key": key}}

        except Exception as e:
            return {"error": f"failed to upsert index entry: {str(e)}", "error_code": "INDEX_UPSERT_FAILED"}
