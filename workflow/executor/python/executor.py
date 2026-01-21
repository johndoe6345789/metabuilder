"""Python Plugin Executor

Runtime for Python workflow plugins.
Communicates with TypeScript via JSON over stdin/stdout.
"""

import json
import sys
import importlib
import importlib.util
from pathlib import Path
from typing import Any, Dict, Optional


class PythonRuntime:
    """Runtime environment for Python plugin execution."""

    def __init__(self):
        self.store: Dict[str, Any] = {}
        self.context: Dict[str, Any] = {}
        self.logger = self._create_logger()

    def _create_logger(self):
        """Create a simple logger that writes to stderr."""
        import logging
        logger = logging.getLogger("workflow.python")
        handler = logging.StreamHandler(sys.stderr)
        handler.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        return logger


def load_plugin(plugin_path: str) -> Any:
    """Dynamically load a Python plugin module."""
    path = Path(plugin_path)
    if not path.exists():
        raise FileNotFoundError(f"Plugin not found: {plugin_path}")

    spec = importlib.util.spec_from_file_location(path.stem, path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load plugin: {plugin_path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def execute_plugin(plugin_path: str, inputs: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a Python plugin and return the result."""
    module = load_plugin(plugin_path)

    if not hasattr(module, "run"):
        raise AttributeError(f"Plugin {plugin_path} has no 'run' function")

    runtime = PythonRuntime()
    runtime.context = context
    runtime.store = context.get("store", {})

    result = module.run(runtime, inputs)

    # Ensure result is a dict
    if not isinstance(result, dict):
        result = {"result": result}

    return result


def main():
    """Main entry point for JSON-based communication."""
    # Read input from stdin
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {e}"}))
        sys.exit(1)

    plugin_path = input_data.get("plugin_path")
    inputs = input_data.get("inputs", {})
    context = input_data.get("context", {})

    if not plugin_path:
        print(json.dumps({"error": "plugin_path is required"}))
        sys.exit(1)

    try:
        result = execute_plugin(plugin_path, inputs, context)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
