"""Run tools with logging and filtering."""


class ToolRunner:
    """Run tool callables with shared logging."""
    def __init__(self, tool_map: dict, msgs: dict, logger):
        self.tool_map = tool_map
        self.msgs = msgs
        self.logger = logger

    def call(self, tool_name: str, **kwargs):
        """Call a named tool with filtered kwargs."""
        tool = self.tool_map.get(tool_name)
        if not tool:
            msg = self.msgs.get(
                "error_tool_not_found",
                "Tool {name} not found or unavailable."
            ).format(name=tool_name)
            self.logger.error(msg)
            return msg

        filtered_kwargs = {k: v for k, v in kwargs.items() if v is not None}
        try:
            result = tool(**filtered_kwargs)
            return result if result is not None else "Success"
        except Exception as error:  # pylint: disable=broad-exception-caught
            error_msg = f"Error executing {tool_name}: {error}"
            self.logger.error(error_msg)
            return error_msg
