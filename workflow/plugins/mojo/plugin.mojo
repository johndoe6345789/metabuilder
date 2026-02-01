# Mojo Workflow Plugin Base Types and Traits
#
# This module defines the base types and traits for workflow plugins in Mojo.
# Mojo is a Python superset with systems programming capabilities, allowing
# for high-performance plugin implementations while maintaining Python interop.

from collections import Dict
from python import PythonObject


# Type alias for plugin input/output dictionaries
alias PluginIO = Dict[String, PythonObject]


trait Plugin:
    """Base trait that all workflow plugins must implement."""

    @staticmethod
    fn name() -> String:
        """Return the plugin name."""
        ...

    @staticmethod
    fn description() -> String:
        """Return the plugin description."""
        ...

    @staticmethod
    fn run(inputs: PluginIO) -> PluginIO:
        """Execute the plugin with the given inputs and return outputs."""
        ...


trait MathPlugin(Plugin):
    """Trait for mathematical operation plugins."""
    pass


trait StringPlugin(Plugin):
    """Trait for string manipulation plugins."""
    pass


trait ListPlugin(Plugin):
    """Trait for list operation plugins."""
    pass


fn create_result[T: AnyType](key: String, value: T) -> PluginIO:
    """Helper function to create a result dictionary with a single key-value pair."""
    var result = PluginIO()
    result[key] = PythonObject(value)
    return result


fn create_error(message: String) -> PluginIO:
    """Helper function to create an error result dictionary."""
    var result = PluginIO()
    result["error"] = PythonObject(message)
    return result


fn get_numbers(inputs: PluginIO, key: String = "numbers") -> DynamicVector[Float64]:
    """Extract a list of numbers from the inputs dictionary."""
    var numbers = DynamicVector[Float64]()
    var py_numbers = inputs.get(key, PythonObject([]))

    for i in range(len(py_numbers)):
        numbers.append(Float64(py_numbers[i]))

    return numbers


fn get_string(inputs: PluginIO, key: String, default: String = "") -> String:
    """Extract a string from the inputs dictionary."""
    if key in inputs:
        return String(inputs[key])
    return default


fn get_strings(inputs: PluginIO, key: String = "strings") -> DynamicVector[String]:
    """Extract a list of strings from the inputs dictionary."""
    var strings = DynamicVector[String]()
    var py_strings = inputs.get(key, PythonObject([]))

    for i in range(len(py_strings)):
        strings.append(String(py_strings[i]))

    return strings
