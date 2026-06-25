"""Execute n8n-style workflows with explicit connections."""
from __future__ import annotations

import logging
from typing import Any, Dict, List

from .execution_order import build_execution_order

logger = logging.getLogger(__name__)


class N8NExecutor:
    """Execute n8n-style workflows."""

    def __init__(self, runtime, plugin_registry):
        self.runtime = runtime
        self.plugin_registry = plugin_registry

    def execute(self, workflow: Dict[str, Any]) -> None:
        """Execute n8n workflow."""
        nodes = workflow.get("nodes", [])
        connections = workflow.get("connections", {})
        triggers = workflow.get("triggers", [])

        if not nodes:
            logger.warning("No nodes in workflow")
            return

        # Find enabled manual trigger (if any)
        start_node_id = self._get_start_node_from_triggers(triggers)

        # Build execution order from connections (optionally starting from trigger node)
        execution_order = build_execution_order(nodes, connections, start_node_id)

        # Execute nodes in order
        for node_name in execution_order:
            node = self._find_node_by_name(nodes, node_name)
            if node:
                self._execute_node(node)

    def _get_start_node_from_triggers(self, triggers: List[Dict]) -> str | None:
        """Get start node ID from enabled manual triggers.

        Args:
            triggers: List of trigger definitions

        Returns:
            Node ID to start from, or None if no suitable trigger found
        """
        if not triggers:
            return None

        # Find first enabled manual trigger
        for trigger in triggers:
            if trigger.get("kind") == "manual" and trigger.get("enabled", True):
                return trigger.get("nodeId")

        # If no manual trigger, use first enabled trigger of any kind
        for trigger in triggers:
            if trigger.get("enabled", True):
                return trigger.get("nodeId")

        return None

    def _find_node_by_name(self, nodes: List[Dict], name: str) -> Dict | None:
        """Find node by name."""
        for node in nodes:
            if node.get("name") == name:
                return node
        return None

    def _execute_node(self, node: Dict[str, Any]) -> Any:
        """Execute single node."""
        node_type = node.get("type")
        node_name = node.get("name", node.get("id"))

        if node.get("disabled"):
            logger.debug("Node %s is disabled, skipping", node_name)
            return None

        if node_type == "control.loop":
            return self._execute_loop(node)

        plugin = self.plugin_registry.get(node_type)
        if not plugin:
            logger.error("Unknown node type: %s", node_type)
            return None

        inputs = node.get("parameters", {})
        logger.debug("Executing node %s (%s)", node_name, node_type)

        result = plugin(self.runtime, inputs)
        return result

    def _execute_loop(self, node: Dict[str, Any]) -> Any:
        """Execute loop node (placeholder)."""
        logger.debug("Loop execution not yet implemented in n8n executor")
        return None
