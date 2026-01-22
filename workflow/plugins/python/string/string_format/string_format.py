"""Workflow plugin: format string with variables."""

from ...base import NodeExecutor


class StringFormat(NodeExecutor):
    """Format string with variables."""

    node_type = "string.format"
    category = "string"
    description = "Format string with variables"

    def execute(self, inputs, runtime=None):
        template = inputs.get("template", "")
        variables = inputs.get("variables", {})
        try:
            return {"result": template.format(**variables)}
        except (KeyError, ValueError) as e:
            return {"result": template, "error": str(e)}
