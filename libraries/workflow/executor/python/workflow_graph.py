"""Build a node/edge view of n8n workflows for visualization."""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, Iterable, List

from autometabuilder.data import get_workflow_content, load_metadata

logger = logging.getLogger(__name__)


def _parse_workflow_definition() -> Dict[str, Any]:
    payload = get_workflow_content()
    if not payload:
        return {"name": "Empty", "nodes": [], "connections": {}}
    try:
        parsed = json.loads(payload)
    except json.JSONDecodeError as exc:
        logger.warning("Invalid workflow JSON: %s", exc)
        return {"name": "Invalid", "nodes": [], "connections": {}}
    return parsed if isinstance(parsed, dict) else {"name": "Invalid", "nodes": [], "connections": {}}


def _gather_n8n_nodes(
    nodes: Iterable[Dict[str, Any]],
    plugin_map: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Extract nodes from n8n format."""
    collected = []
    for node in nodes:
        node_id = node.get("id", node.get("name", f"node-{len(collected)}"))
        node_type = node.get("type", "unknown")
        metadata = plugin_map.get(node_type, {})

        collected.append({
            "id": node_id,
            "name": node.get("name", node_id),
            "type": node_type,
            "label_key": metadata.get("label"),
            "parent": None,
            "position": node.get("position", [0, 0]),
        })
    return collected


def _build_n8n_edges(
    connections: Dict[str, Any],
    nodes: List[Dict[str, Any]]
) -> List[Dict[str, str]]:
    """Build edges from n8n connections."""
    # Build name to ID mapping
    name_to_id = {node["name"]: node["id"] for node in nodes}

    edges = []
    for source_name, outputs in connections.items():
        source_id = name_to_id.get(source_name, source_name)

        for output_type, indices in outputs.items():
            for index, targets in indices.items():
                for target in targets:
                    target_name = target["node"]
                    target_id = name_to_id.get(target_name, target_name)

                    edges.append({
                        "from": source_id,
                        "to": target_id,
                        "type": target.get("type", "main"),
                        "output_index": index,
                        "input_index": target.get("index", 0),
                    })
    return edges


def build_workflow_graph() -> Dict[str, Any]:
    """Build workflow graph from n8n format (breaking change: legacy format removed)."""
    definition = _parse_workflow_definition()
    plugin_map = load_metadata().get("workflow_plugins", {})

    # Only support n8n format now
    nodes = _gather_n8n_nodes(definition.get("nodes", []), plugin_map)
    edges = _build_n8n_edges(definition.get("connections", {}), nodes)

    logger.debug("Built workflow graph with %d nodes and %d edges", len(nodes), len(edges))
    return {
        "nodes": nodes,
        "edges": edges,
        "count": {"nodes": len(nodes), "edges": len(edges)},
    }
