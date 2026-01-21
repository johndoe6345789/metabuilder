"""N8N workflow format handler."""
from __future__ import annotations

import logging
from typing import Any, Dict

from .n8n_executor import N8NExecutor

logger = logging.getLogger(__name__)


def is_n8n_workflow(workflow: Dict[str, Any]) -> bool:
    """Check if workflow uses n8n schema."""
    if not isinstance(workflow, dict):
        return False

    # N8N workflows must have explicit connections
    has_connections = "connections" in workflow
    nodes = workflow.get("nodes", [])

    if not nodes:
        return has_connections

    # Check if nodes have n8n properties
    first_node = nodes[0] if isinstance(nodes, list) and nodes else {}
    has_position = "position" in first_node
    has_type_version = "typeVersion" in first_node
    has_name = "name" in first_node

    return has_connections and (has_position or has_type_version or has_name)


class WorkflowAdapter:
    """Execute n8n workflows (breaking change: legacy format no longer supported)."""

    def __init__(self, node_executor, runtime, plugin_registry):
        self.runtime = runtime
        self.plugin_registry = plugin_registry
        self.n8n_executor = N8NExecutor(runtime, plugin_registry)

    def execute(self, workflow: Dict[str, Any]) -> None:
        """Execute n8n workflow."""
        if not is_n8n_workflow(workflow):
            logger.error("Legacy workflow format is no longer supported. Please migrate to n8n schema.")
            raise ValueError("Only n8n workflow format is supported")

        logger.debug("Executing n8n workflow")
        self.n8n_executor.execute(workflow)
