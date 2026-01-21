"""Build execution order for n8n workflows."""
from __future__ import annotations

from typing import Any, Dict, List, Set


def build_execution_order(
    nodes: List[Dict[str, Any]],
    connections: Dict[str, Any],
    start_node_id: str | None = None
) -> List[str]:
    """Build topological execution order from connections.

    Args:
        nodes: List of workflow nodes
        connections: Node connections map
        start_node_id: Optional node ID to start execution from (from trigger)

    Returns:
        List of node names in execution order
    """
    node_names = {node["name"] for node in nodes}
    has_inputs = _find_nodes_with_inputs(connections)

    # If a start node is specified (from trigger), use it
    if start_node_id:
        start_node_name = _find_node_name_by_id(nodes, start_node_id)
        if start_node_name:
            # Start with the trigger node
            order = [start_node_name]
            # Add remaining nodes
            remaining = node_names - {start_node_name}
            order.extend(_add_remaining_nodes(remaining))
            return order

    # Default: Start with nodes that have no inputs
    order = [name for name in node_names if name not in has_inputs]

    # Add remaining nodes (simplified BFS)
    remaining = node_names - set(order)
    order.extend(_add_remaining_nodes(remaining))

    return order


def _find_nodes_with_inputs(connections: Dict[str, Any]) -> Set[str]:
    """Find all nodes that have incoming connections."""
    has_inputs = set()

    for source_name, outputs in connections.items():
        for output_type, indices in outputs.items():
            for targets in indices.values():
                for target in targets:
                    has_inputs.add(target["node"])

    return has_inputs


def _find_node_name_by_id(nodes: List[Dict[str, Any]], node_id: str) -> str | None:
    """Find node name by node ID."""
    for node in nodes:
        if node.get("id") == node_id:
            return node.get("name")
    return None


def _add_remaining_nodes(remaining: Set[str]) -> List[str]:
    """Add remaining nodes in order."""
    order = []
    while remaining:
        name = next(iter(remaining))
        order.append(name)
        remaining.remove(name)
    return order
