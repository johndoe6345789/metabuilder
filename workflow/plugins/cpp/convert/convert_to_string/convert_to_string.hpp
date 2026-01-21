#pragma once
/**
 * Workflow plugin: convert value to string
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::convert {

inline PluginResult to_string(Runtime&, const json& inputs) {
    json value = inputs.value("value", json{});
    std::string result;

    if (value.is_string()) {
        result = value.get<std::string>();
    } else if (value.is_number_integer()) {
        result = std::to_string(value.get<int64_t>());
    } else if (value.is_number_float()) {
        result = std::to_string(value.get<double>());
    } else if (value.is_boolean()) {
        result = value.get<bool>() ? "true" : "false";
    } else if (value.is_null()) {
        result = "null";
    } else {
        // For arrays and objects, serialize to JSON string
        result = value.dump();
    }

    return {{"result", result}};
}

} // namespace metabuilder::workflow::convert
