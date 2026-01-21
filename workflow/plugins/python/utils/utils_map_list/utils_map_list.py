"""Workflow plugin: map list."""


def run(_runtime, inputs):
    """Map items to formatted strings."""
    items = inputs.get("items", [])
    if not isinstance(items, list):
        items = [items] if items else []

    template = inputs.get("template", "{item}")
    mapped = []

    for item in items:
        try:
            mapped.append(template.format(item=item))
        except Exception:
            mapped.append(str(item))

    return {"items": mapped}
