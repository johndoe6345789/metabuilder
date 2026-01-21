#pragma once
/**
 * Workflow plugin: convert value to JSON string
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::convert {

inline PluginResult to_json(Runtime&, const json& inputs) {
    json value = inputs.value("value", json{});
    int indent = inputs.contains("indent") ? inputs["indent"].get<int>() : -1;

    try {
        std::string result;
        if (indent >= 0) {
            result = value.dump(indent);
        } else {
            result = value.dump();
        }
        return {{"result", result}};
    } catch (const std::exception& e) {
        return {{"result", nullptr}, {"error", e.what()}};
    }
}

} // namespace metabuilder::workflow::convert
