#pragma once
/**
 * Workflow plugin: convert value to boolean
 */

#include "../../plugin.hpp"
#include <algorithm>

namespace metabuilder::workflow::convert {

inline PluginResult to_boolean(Runtime&, const json& inputs) {
    json value = inputs.value("value", json{});

    if (value.is_boolean()) {
        return {{"result", value.get<bool>()}};
    }

    if (value.is_string()) {
        std::string str = value.get<std::string>();
        std::transform(str.begin(), str.end(), str.begin(), ::tolower);
        bool falsy = (str == "false" || str == "0" || str.empty() || str == "none" || str == "null");
        return {{"result", !falsy}};
    }

    if (value.is_number()) {
        return {{"result", value.get<double>() != 0.0}};
    }

    if (value.is_null()) {
        return {{"result", false}};
    }

    if (value.is_array()) {
        return {{"result", !value.empty()}};
    }

    if (value.is_object()) {
        return {{"result", !value.empty()}};
    }

    return {{"result", false}};
}

} // namespace metabuilder::workflow::convert
