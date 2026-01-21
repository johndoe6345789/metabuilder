"""Workflow plugin: concatenate strings."""


def run(_runtime, inputs):
    """Concatenate multiple strings."""
    strings = inputs.get("strings", [])
    separator = inputs.get("separator", "")

    str_list = [str(s) for s in strings]
    return {"result": separator.join(str_list)}
