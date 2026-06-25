"""Workflow plugin: parse CLI arguments."""

import argparse

from ...base import NodeExecutor


class ParseCliArgs(NodeExecutor):
    """Parse command line arguments."""

    node_type = "backend.parse_cli_args"
    category = "backend"
    description = "Parse command line arguments"

    def execute(self, inputs, runtime=None):
        """Parse command line arguments.

        Inputs:
            args: Optional list of arguments (defaults to sys.argv)
        """
        parser = argparse.ArgumentParser(description="MetaBuilder Workflow")

        parser.add_argument("--config", "-c", default="config.json",
                           help="Path to configuration file")
        parser.add_argument("--workflow", "-w",
                           help="Path to workflow file")
        parser.add_argument("--verbose", "-v", action="store_true",
                           help="Enable verbose output")
        parser.add_argument("--dry-run", action="store_true",
                           help="Simulate workflow execution")

        args_list = inputs.get("args")
        parsed = parser.parse_args(args_list)

        runtime.context["cli_args"] = vars(parsed)

        return {"success": True, "args": vars(parsed)}
