"""Workflow plugin registry with automatic plugin discovery."""
import json
import logging
import os
from pathlib import Path
from .plugin_loader import load_plugin_callable

logger = logging.getLogger("autometabuilder")


def scan_plugins() -> dict:
    """
    Automatically scan and discover workflow plugins.

    Scans the plugins directory and subdirectories, looking for package.json files
    that define plugins. Returns a map of plugin_name -> callable_path.

    Plugin structure:
    - Each plugin is in its own directory with a package.json file
    - Plugin name can be in "metadata.plugin_type" (preferred) or "name" field
    - package.json must have a "main" field pointing to the Python file
    - The Python file must have a "run" function
    """
    plugin_map = {}
    plugins_base = Path(__file__).parent / "plugins"

    if not plugins_base.exists():
        logger.warning("Plugins directory not found: %s", plugins_base)
        return plugin_map

    # Scan all subdirectories for package.json files
    for package_json_path in plugins_base.rglob("package.json"):
        try:
            # Read package.json
            with open(package_json_path, "r", encoding="utf-8") as f:
                package_data = json.load(f)

            # Try metadata.plugin_type first (preferred), then fall back to name
            metadata = package_data.get("metadata", {})
            plugin_name = metadata.get("plugin_type") or package_data.get("name")
            main_file = package_data.get("main")

            if not plugin_name or not main_file:
                logger.debug("Skipping %s: missing 'plugin_type'/'name' or 'main' field", package_json_path)
                continue

            # Build the Python module path
            plugin_dir = package_json_path.parent
            main_file_stem = Path(main_file).stem  # Remove .py extension

            # Calculate relative path from plugins directory
            rel_path = plugin_dir.relative_to(plugins_base)

            # Build module path: autometabuilder.workflow.plugins.<category>.<plugin_dir>.<main_file>.run
            parts = ["autometabuilder", "workflow", "plugins"] + list(rel_path.parts) + [main_file_stem, "run"]
            callable_path = ".".join(parts)

            plugin_map[plugin_name] = callable_path
            logger.debug("Discovered plugin %s -> %s", plugin_name, callable_path)

        except json.JSONDecodeError:
            logger.warning("Invalid JSON in %s", package_json_path)
        except Exception as error:  # pylint: disable=broad-exception-caught
            logger.debug("Error scanning %s: %s", package_json_path, error)

    logger.info("Discovered %d plugins via scanning", len(plugin_map))
    return plugin_map


def load_plugin_map() -> dict:
    """
    Load workflow plugin map.

    This function now uses automatic plugin discovery by scanning the plugins
    directory instead of reading from a static plugin_map.json file.

    Falls back to plugin_map.json if it exists (for backwards compatibility).
    """
    # Try scanning first
    plugin_map = scan_plugins()

    # If no plugins found, try legacy plugin_map.json as fallback
    if not plugin_map:
        map_path = os.path.join(os.path.dirname(__file__), "plugin_map.json")
        if os.path.exists(map_path):
            logger.info("Using legacy plugin_map.json")
            try:
                with open(map_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    plugin_map = data if isinstance(data, dict) else {}
            except json.JSONDecodeError:
                logger.error("Invalid workflow plugin map JSON.")

    return plugin_map


class PluginRegistry:
    """Resolve workflow plugin handlers."""
    def __init__(self, plugin_map: dict):
        self._plugins = {}
        for node_type, path in plugin_map.items():
            try:
                self._plugins[node_type] = load_plugin_callable(path)
                logger.debug("Registered workflow plugin %s -> %s", node_type, path)
            except Exception as error:  # pylint: disable=broad-exception-caught
                logger.error("Failed to register plugin %s: %s", node_type, error)

    def get(self, node_type: str):
        """Return plugin handler for node type."""
        return self._plugins.get(node_type)
