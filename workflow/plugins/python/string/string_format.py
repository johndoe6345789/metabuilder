"""Workflow plugin: format string with variables."""


def run(_runtime, inputs):
    """Format string with variables."""
    template = inputs.get("template", "")
    variables = inputs.get("variables", {})

    try:
        result = template.format(**variables)
        return {"result": result}
    except (KeyError, ValueError) as e:
        return {"result": template, "error": str(e)}
