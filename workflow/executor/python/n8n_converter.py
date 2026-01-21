"""Convert legacy workflows to n8n schema."""
from __future__ import annotations

import logging
from typing import Any, Dict, List
from uuid import uuid4

logger = logging.getLogger(__name__)


def _generate_node_id() -> str:
    """Generate unique node ID."""
    return str(uuid4())


def _calculate_position(index: int, parent_level: int = 0) -> List[float]:
    """Calculate node position on canvas."""
    x = parent_level * 300.0
    y = index * 100.0
    return [x, y]


def _convert_node(
    node: Dict[str, Any],
    index: int,
    parent_level: int = 0
) -> Dict[str, Any]:
    """Convert legacy node to n8n format."""
    node_id = node.get("id", f"node-{_generate_node_id()}")
    node_type = node.get("type", "unknown")

    n8n_node: Dict[str, Any] = {
        "id": node_id,
        "name": node.get("name", node_id),
        "type": node_type,
        "typeVersion": 1,
        "position": _calculate_position(index, parent_level),
        "parameters": node.get("inputs", {}),
    }

    if node.get("disabled"):
        n8n_node["disabled"] = True
    if node.get("notes"):
        n8n_node["notes"] = node["notes"]

    return n8n_node


def _build_connections(
    nodes: List[Dict[str, Any]],
    legacy_nodes: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Build n8n connections from variable bindings."""
    connections: Dict[str, Any] = {}
    producers: Dict[str, str] = {}

    # Map variable names to producer nodes
    for i, legacy_node in enumerate(legacy_nodes):
        outputs = legacy_node.get("outputs", {})
        node_name = nodes[i]["name"]
        for var_name in outputs.values():
            if isinstance(var_name, str):
                producers[var_name] = node_name

    # Build connections from inputs
    for i, legacy_node in enumerate(legacy_nodes):
        inputs = legacy_node.get("inputs", {})
        target_name = nodes[i]["name"]

        for port, value in inputs.items():
            if isinstance(value, str) and value.startswith("$"):
                var_name = value[1:]
                source_name = producers.get(var_name)

                if source_name:
                    if source_name not in connections:
                        connections[source_name] = {"main": {}}

                    if "0" not in connections[source_name]["main"]:
                        connections[source_name]["main"]["0"] = []

                    connections[source_name]["main"]["0"].append({
                        "node": target_name,
                        "type": "main",
                        "index": 0
                    })

    return connections


def convert_to_n8n(legacy_workflow: Dict[str, Any]) -> Dict[str, Any]:
    """Convert legacy workflow to n8n schema."""
    legacy_nodes = legacy_workflow.get("nodes", [])

    n8n_nodes = [
        _convert_node(node, i)
        for i, node in enumerate(legacy_nodes)
    ]

    connections = _build_connections(n8n_nodes, legacy_nodes)

    return {
        "id": legacy_workflow.get("id", _generate_node_id()),
        "name": legacy_workflow.get("name", "Workflow"),
        "active": legacy_workflow.get("active", False),
        "nodes": n8n_nodes,
        "connections": connections,
        "settings": legacy_workflow.get("settings", {}),
        "tags": legacy_workflow.get("tags", []),
    }
