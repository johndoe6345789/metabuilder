"""
Plugin factory for creating workflow plugins from simple functions.

This module provides a factory pattern for generating plugins. Plugins should
NOT call these functions at module load time - instead they should just export
NODE_TYPE, CATEGORY, DESCRIPTION, and impl. The registry handles instantiation.
"""

from typing import Any, Callable, Dict, List

from .base import NodeExecutor


def create_plugin(
    node_type: str,
    category: str,
    description: str,
    execute_fn: Callable[[Dict[str, Any], Any], Dict[str, Any]],
) -> NodeExecutor:
    """
    Create a plugin executor from a simple function.

    Args:
        node_type: The node type identifier (e.g., "math.add")
        category: Plugin category (e.g., "math")
        description: Human-readable description
        execute_fn: Function that takes (inputs, runtime) and returns result dict

    Returns:
        NodeExecutor instance with run() method exposed
    """

    class DynamicExecutor(NodeExecutor):
        pass

    DynamicExecutor.node_type = node_type
    DynamicExecutor.category = category
    DynamicExecutor.description = description
    DynamicExecutor.execute = lambda self, inputs, runtime=None: execute_fn(
        inputs, runtime
    )

    return DynamicExecutor()


def wrap_math_impl(
    fn: Callable[..., float],
    input_keys: List[str] = None,
    array_key: str = None,
) -> Callable[[Dict[str, Any], Any], Dict[str, Any]]:
    """
    Wrap a math function to handle common input patterns.

    Args:
        fn: Math function to apply
        input_keys: List of input parameter names (for binary ops like a, b)
        array_key: Key for array input (for reduce ops like sum)

    Returns:
        Wrapped impl function
    """

    def impl(inputs, runtime=None):
        try:
            if array_key:
                values = inputs.get(array_key, inputs.get("values", []))
                result = fn([float(v) for v in values])
            elif input_keys:
                args = [float(inputs.get(k, 0)) for k in input_keys]
                result = fn(*args)
            else:
                value = float(inputs.get("value", 0))
                result = fn(value)
            return {"result": result}
        except Exception as e:
            return {"error": str(e)}

    return impl


def wrap_string_impl(
    fn: Callable[[str, Dict[str, Any]], str],
) -> Callable[[Dict[str, Any], Any], Dict[str, Any]]:
    """
    Wrap a string function to handle common input patterns.

    Args:
        fn: Function that takes (value, inputs) and returns transformed string

    Returns:
        Wrapped impl function
    """

    def impl(inputs, runtime=None):
        try:
            value = str(inputs.get("value", inputs.get("text", "")))
            result = fn(value, inputs)
            return {"result": result}
        except Exception as e:
            return {"error": str(e)}

    return impl


def wrap_logic_impl(
    fn: Callable[[Dict[str, Any]], bool],
) -> Callable[[Dict[str, Any], Any], Dict[str, Any]]:
    """
    Wrap a logic function to handle common input patterns.

    Args:
        fn: Function that takes inputs and returns boolean

    Returns:
        Wrapped impl function
    """

    def impl(inputs, runtime=None):
        try:
            result = fn(inputs)
            return {"result": result}
        except Exception as e:
            return {"error": str(e)}

    return impl


def wrap_list_impl(
    fn: Callable[[List[Any], Dict[str, Any]], Any],
) -> Callable[[Dict[str, Any], Any], Dict[str, Any]]:
    """
    Wrap a list function to handle common input patterns.

    Args:
        fn: Function that takes (array, inputs) and returns result

    Returns:
        Wrapped impl function
    """

    def impl(inputs, runtime=None):
        try:
            array = inputs.get("array", inputs.get("list", []))
            result = fn(array, inputs)
            return {"result": result}
        except Exception as e:
            return {"error": str(e)}

    return impl


def wrap_dict_impl(
    fn: Callable[[Dict[str, Any], Dict[str, Any]], Any],
) -> Callable[[Dict[str, Any], Any], Dict[str, Any]]:
    """
    Wrap a dict function to handle common input patterns.

    Args:
        fn: Function that takes (obj, inputs) and returns result

    Returns:
        Wrapped impl function
    """

    def impl(inputs, runtime=None):
        try:
            obj = inputs.get("object", inputs.get("dict", {}))
            result = fn(obj, inputs)
            return {"result": result}
        except Exception as e:
            return {"error": str(e)}

    return impl
