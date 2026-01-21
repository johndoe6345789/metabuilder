"""Workflow plugin: build prompt YAML."""


def run(_runtime, inputs):
    """Build prompt YAML from system and user content."""
    system_content = inputs.get("system_content")
    user_content = inputs.get("user_content")
    model = inputs.get("model")

    def indent_block(text):
        if not text:
            return ""
        return "\n      ".join(line.rstrip() for line in text.splitlines())

    model_value = model or "openai/gpt-4o"
    system_block = indent_block(system_content)
    user_block = indent_block(user_content)

    yaml_content = f"""messages:
  - role: system
    content: >-
      {system_block}
  - role: user
    content: >-
      {user_block}
model: {model_value}
"""

    return {"result": yaml_content}
