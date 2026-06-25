"""Handle tool calls from LLM responses."""
import json


def handle_tool_calls(resp_msg, tool_map: dict, msgs: dict, args, policies: dict, logger) -> list:
    """Execute tool calls and return tool result messages."""
    if not resp_msg.tool_calls:
        return []

    modifying_tools = set(policies.get("modifying_tools", []))
    tool_results = []

    for tool_call in resp_msg.tool_calls:
        function_name = tool_call.function.name
        call_id = tool_call.id
        payload = json.loads(tool_call.function.arguments)
        logger.trace("Tool call %s payload: %s", function_name, payload)

        handler = tool_map.get(function_name)
        if not handler:
            msg_template = msgs.get(
                "error_tool_not_found",
                "Tool {name} not found or unavailable."
            )
            msg = msg_template.format(name=function_name)
            logger.error(msg)
            tool_results.append({
                "tool_call_id": call_id,
                "role": "tool",
                "name": function_name,
                "content": msg,
            })
            continue

        if not args.yolo:
            confirm = input(
                msgs.get(
                    "confirm_tool_execution",
                    "Do you want to execute {name} with {args}? [y/N]: "
                ).format(name=function_name, args=payload)
            )
            if confirm.lower() != "y":
                skipped_template = msgs.get("info_tool_skipped", "Skipping tool: {name}")
                logger.info(skipped_template.format(name=function_name))
                tool_results.append({
                    "tool_call_id": call_id,
                    "role": "tool",
                    "name": function_name,
                    "content": "Skipped by user.",
                })
                continue

        if args.dry_run and function_name in modifying_tools:
            logger.info(
                msgs.get(
                    "info_dry_run_skipping",
                    "DRY RUN: Skipping state-modifying tool {name}"
                ).format(name=function_name)
            )
            tool_results.append({
                "tool_call_id": call_id,
                "role": "tool",
                "name": function_name,
                "content": "Skipped due to dry-run.",
            })
            continue

        exec_template = msgs.get("info_executing_tool", "Executing tool: {name}")
        logger.info(exec_template.format(name=function_name))
        try:
            result = handler(**payload)
            content = str(result) if result is not None else "Success"
            if hasattr(result, "__iter__") and not isinstance(result, str):
                items = list(result)[:5]
                content = "\n".join([f"- {item}" for item in items])
                logger.info(content)
            elif result is not None:
                logger.info(result)

            tool_results.append({
                "tool_call_id": call_id,
                "role": "tool",
                "name": function_name,
                "content": content,
            })
        except Exception as error:  # pylint: disable=broad-exception-caught
            error_msg = f"Error executing {function_name}: {error}"
            logger.error(error_msg)
            tool_results.append({
                "tool_call_id": call_id,
                "role": "tool",
                "name": function_name,
                "content": error_msg,
            })

    return tool_results
