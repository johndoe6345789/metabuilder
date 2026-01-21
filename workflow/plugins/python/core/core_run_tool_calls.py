"""Workflow plugin: run tool calls."""


def run(runtime, inputs):
    """Execute tool calls from an AI response."""
    resp_msg = inputs.get("response")
    tool_calls = getattr(resp_msg, "tool_calls", None) or []
    if not resp_msg:
        return {"tool_results": [], "no_tool_calls": True}

    # Handle tool calls using tool map from context
    tool_results = []
    tool_map = runtime.context.get("tool_map", {})

    for tool_call in tool_calls:
        func_name = tool_call.function.name
        if func_name in tool_map:
            try:
                import json
                args = json.loads(tool_call.function.arguments)
                result = tool_map[func_name](**args)
                tool_results.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": str(result)
                })
            except Exception as e:
                tool_results.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": f"Error: {str(e)}"
                })

    return {
        "tool_results": tool_results,
        "no_tool_calls": not bool(tool_calls)
    }
