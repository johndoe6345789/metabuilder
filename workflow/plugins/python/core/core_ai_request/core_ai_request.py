"""Workflow plugin: AI request."""

from tenacity import retry, stop_after_attempt, wait_exponential

from ...base import NodeExecutor


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def _get_completion(client, model, messages, tools):
    """Request a chat completion with retries."""
    return client.chat.completions.create(
        model=model,
        messages=messages,
        tools=tools,
        tool_choice="auto",
        temperature=1.0,
        top_p=1.0,
    )


class CoreAiRequest(NodeExecutor):
    """Invoke the AI model with current messages."""

    node_type = "core.ai_request"
    category = "core"
    description = "Invoke the AI model with current messages and return the response"

    def execute(self, inputs, runtime=None):
        """Invoke the model with current messages."""
        messages = list(inputs.get("messages") or [])
        response = _get_completion(
            runtime.context["client"],
            runtime.context["model_name"],
            messages,
            runtime.context["tools"]
        )
        resp_msg = response.choices[0].message
        runtime.logger.info(
            resp_msg.content
            if resp_msg.content
            else runtime.context["msgs"]["info_tool_call_requested"]
        )
        messages.append(resp_msg)
        tool_calls = getattr(resp_msg, "tool_calls", None) or []
        return {
            "response": resp_msg,
            "has_tool_calls": bool(tool_calls),
            "tool_calls_count": len(tool_calls)
        }
