#pragma once
/**
 * Workflow plugin: convert value to number
 */

#include "../../plugin.hpp"
#include <cstdlib>

namespace metabuilder::workflow::convert {

inline PluginResult to_number(Runtime&, const json& inputs) {
    json value = inputs.value("value", json{});
    double default_val = inputs.value("default", 0.0);

    if (value.is_number()) {
        return {{"result", value.get<double>()}};
    }

    if (value.is_string()) {
        std::string str = value.get<std::string>();
        char* end;
        double num = std::strtod(str.c_str(), &end);
        if (end != str.c_str() && *end == '\0') {
            return {{"result", num}};
        }
    }

    if (value.is_boolean()) {
        return {{"result", value.get<bool>() ? 1.0 : 0.0}};
    }

    return {{"result", default_val}};
}

} // namespace metabuilder::workflow::convert
