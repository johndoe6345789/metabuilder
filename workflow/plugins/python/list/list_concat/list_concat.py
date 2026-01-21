"""Workflow plugin: concatenate lists."""


def run(_runtime, inputs):
    """Concatenate multiple lists."""
    lists = inputs.get("lists", [])
    result = []
    for lst in lists:
        if isinstance(lst, list):
            result.extend(lst)
    return {"result": result}
