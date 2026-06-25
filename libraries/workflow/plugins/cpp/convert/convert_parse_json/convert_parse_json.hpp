#pragma once
/**
 * Workflow plugin: parse JSON string
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::convert {

inline PluginResult parse_json(Runtime&, const json& inputs) {
    std::string str = inputs.value("value", "");
    json default_val = inputs.value("default", json{});

    if (str.empty()) {
        return {{"result", default_val}, {"success", false}, {"error", "Empty input"}};
    }

    try {
        json parsed = json::parse(str);
        return {{"result", parsed}, {"success", true}};
    } catch (const json::parse_error& e) {
        return {{"result", default_val}, {"success", false}, {"error", e.what()}};
    }
}

} // namespace metabuilder::workflow::convert
